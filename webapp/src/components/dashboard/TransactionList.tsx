import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Transaction, Account } from "../../types/banking";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  currentUserId: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  currentUserId,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta Externa";
  };

  const isOutgoing = (transaction: Transaction) => {
    return accounts.some(
      (acc) =>
        acc.id === transaction.fromAccountId && acc.userId === currentUserId
    );
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Transacciones Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay transacciones recientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Transacciones Recientes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.slice(0, 10).map((transaction) => {
          const outgoing = isOutgoing(transaction);
          return (
            <div
              key={transaction.id}
              className="transaction-item flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    outgoing ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {outgoing ? (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {outgoing
                      ? "Transferencia enviada"
                      : "Transferencia recibida"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {outgoing
                      ? `A: ${getAccountName(transaction.toAccountId)}`
                      : `De: ${getAccountName(transaction.fromAccountId)}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    outgoing ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {outgoing ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
