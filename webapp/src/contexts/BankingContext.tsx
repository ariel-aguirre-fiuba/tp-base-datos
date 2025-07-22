import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction } from "../types/banking";
import { useAuth } from "./AuthContext";
import {
  createAcc,
  getAccounts,
  getAllAccounts,
  getTransactions,
  transfer,
} from "@/helpers/api";
import { parseTransferTypeFromDb } from "@/helpers/parsers";

interface BankingContextType {
  accounts: Account[];
  allAccounts: Account[];
  transactions: Transaction[];
  createAccount: (type: "checking" | "savings", name: string) => Promise<void>;
  transferMoney: (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string
  ) => Promise<boolean>;
  getAccountBalance: (accountId: string) => number;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's accounts and transactions
      getAccounts(user.id).then((accounts) => {
        const accountsData =
          accounts?.map((acc: any) => ({
            id: acc.id_cuenta,
            type: acc.tipo_cuenta === "Ahorro" ? "savings" : "checking",
            balance: parseFloat(acc.saldo),
            accountNumber: acc.numero_cuenta,
            name: acc.numero_cuenta,
          })) || [];
        setAccounts(accountsData);
      });

      getTransactions(user.id).then((txs) => {
        const transactionsData =
          txs?.map((tx: any) => ({
            id: tx.id_transaccion,
            amount: tx.monto,
            type: parseTransferTypeFromDb(tx.tipo_transaccion),
            timestamp: new Date(tx.fecha_hora),
            fromAccountId: tx.cuenta_origen_numero,
            toAccountId: tx.cuenta_destino_numero,
            description: tx.tipo_transaccion,
          })) || [];

        setTransactions(transactionsData);
      });

      getAllAccounts().then((accounts) => {
        const accountsData =
          accounts?.map((acc: any) => ({
            id: acc.id_cuenta,
            type: acc.tipo_cuenta === "Ahorro" ? "savings" : "checking",
            balance: parseFloat(acc.saldo),
            accountNumber: acc.numero_cuenta,
            name: acc.numero_cuenta,
          })) || [];
        setAllAccounts(accountsData);
      });
    } else {
      setAccounts([]);
      setTransactions([]);
      setAllAccounts([]);
    }
  }, [user]);

  const createAccount = async (type: "checking" | "savings", name: string) => {
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
    const response = await createAcc(
      newAccount.accountNumber,
      newAccount.type === "checking" ? "Corriente" : "Ahorro",
      user.id
    );

    if (!response) {
      return false;
    }
    setAccounts((prev) => [...prev, newAccount]);
  };

  const transferMoney = async (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string
  ) => {
    const fromAccount = accounts.find((acc: any) => acc.id === +fromAccountId);

    if (!fromAccount || fromAccount.balance < amount || amount <= 0) {
      return false;
    }

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId.toString()) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId.toString()) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    );

    // Create transaction record
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      fromAccountId: fromAccountId.toString(),
      toAccountId: toAccountId.toString(),
      amount,
      description,
      timestamp: new Date(),
      type: "transfer",
    };

    const response = await transfer(amount, fromAccountId, toAccountId);

    if (!response) {
      return false;
    }

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
        allAccounts,
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
