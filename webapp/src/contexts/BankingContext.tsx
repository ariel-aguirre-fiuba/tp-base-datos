import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction } from "../types/banking";
import { useAuth } from "./AuthContext";
import { getAccounts, getTransactions } from "@/helpers/api";

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

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's accounts and transactions
      getAccounts(user.id).then((accounts) => {
        const accountsData =
          accounts?.map((acc: any) => ({
            id: acc.id_cuenta,
            type: acc.tipo_cuenta, // TODO Parsing
            balance: parseFloat(acc.saldo),
            accountNumber: acc.numero_cuenta,
            nombre: acc.tipo_cuenta,
          })) || [];
        setAccounts(accountsData);
      });

      getTransactions(user.id).then((txs) => {
        const transactionsData =
          txs?.map((tx: any) => ({
            id: tx.id_transaccion,
            amount: tx.monto,
            type: tx.tipo_transaccion, // TODO Parsing
            timestamp: new Date(tx.fecha_hora),
            fromAccountId: tx.cuenta_origen_numero,
            toAccountId: tx.cuenta_destino_numero,
          })) || [];

        setTransactions(transactionsData);
      });
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
