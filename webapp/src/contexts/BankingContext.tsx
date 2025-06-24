import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction } from "../types/banking";
import { useAuth } from "./AuthContext";

interface BankingContextType {
  accounts: Account[];
  transactions: Transaction[];
  createAccount: (type: "checking" | "savings", name: string) => void;
  transferMoney: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ) => boolean;
  getAccountBalance: (accountId: string) => number;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

// Mock accounts data
const mockAccountsData: Account[] = [
  {
    id: "acc1",
    userId: "1",
    type: "checking",
    balance: 15420.5,
    accountNumber: "0001-2345-6789",
    name: "Cuenta Corriente Principal",
  },
  {
    id: "acc2",
    userId: "1",
    type: "savings",
    balance: 25000.0,
    accountNumber: "0001-2345-6790",
    name: "Caja de Ahorro",
  },
  {
    id: "acc3",
    userId: "2",
    type: "checking",
    balance: 8750.25,
    accountNumber: "0002-2345-6789",
    name: "Cuenta Corriente Principal",
  },
];

// Mock transactions data
const mockTransactionsData: Transaction[] = [
  {
    id: "tx1",
    fromAccountId: "acc1",
    toAccountId: "acc2",
    amount: 500.0,
    description: "Transferencia para ahorros",
    timestamp: new Date("2024-06-20T10:30:00"),
    type: "transfer",
  },
  {
    id: "tx2",
    fromAccountId: "acc2",
    toAccountId: "acc1",
    amount: 200.0,
    description: "Retiro para gastos",
    timestamp: new Date("2024-06-19T14:15:00"),
    type: "transfer",
  },
  {
    id: "tx3",
    fromAccountId: "acc1",
    toAccountId: "acc3",
    amount: 750.0,
    description: "Pago de servicios",
    timestamp: new Date("2024-06-18T09:45:00"),
    type: "transfer",
  },
];

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's accounts and transactions
      const userAccounts = mockAccountsData.filter(
        (acc) => acc.userId === user.id
      );
      const userTransactions = mockTransactionsData.filter((tx) =>
        userAccounts.some(
          (acc) => acc.id === tx.fromAccountId || acc.id === tx.toAccountId
        )
      );
      setAccounts(userAccounts);
      setTransactions(userTransactions);
    } else {
      setAccounts([]);
      setTransactions([]);
    }
  }, [user]);

  const createAccount = (type: "checking" | "savings", name: string) => {
    if (!user) return;

    const newAccount: Account = {
      id: `acc${Date.now()}`,
      userId: user.id,
      type,
      balance: 0,
      accountNumber: `000${user.id}-${Date.now()
        .toString()
        .slice(-4)}-${Math.floor(Math.random() * 10000)}`,
      name,
    };

    setAccounts((prev) => [...prev, newAccount]);
    mockAccountsData.push(newAccount);
  };

  const transferMoney = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ): boolean => {
    const fromAccount = accounts.find((acc) => acc.id === fromAccountId);

    if (!fromAccount || fromAccount.balance < amount || amount <= 0) {
      return false;
    }

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );

    // Create transaction record
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      fromAccountId,
      toAccountId,
      amount,
      description,
      timestamp: new Date(),
      type: "transfer",
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    mockTransactionsData.unshift(newTransaction);

    return true;
  };

  const getAccountBalance = (accountId: string): number => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.balance : 0;
  };

  return (
    <BankingContext.Provider
      value={{
        accounts,
        transactions,
        createAccount,
        transferMoney,
        getAccountBalance,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error("useBanking must be used within a BankingProvider");
  }
  return context;
};
