import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Account } from "../../types/banking";

interface AccountCardProps {
  account: Account;
  onTransfer: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onTransfer }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getAccountIcon = () => {
    return account.type === "checking" ? (
      <CreditCard className="h-6 w-6" />
    ) : (
      <PiggyBank className="h-6 w-6" />
    );
  };

  const getAccountTypeLabel = () => {
    return account.type === "checking" ? "Cuenta Corriente" : "Caja de Ahorro";
  };

  return (
    <Card className="account-card text-white border-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getAccountIcon()}
            <div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              <p className="text-blue-100 text-sm">{getAccountTypeLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Número de cuenta</p>
            <p className="font-mono text-sm">{account.accountNumber}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-blue-100 text-sm mb-1">Saldo disponible</p>
          <p className="text-3xl font-bold balance-animation">
            {formatCurrency(account.balance)}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onTransfer}
            variant="secondary"
            size="sm"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Transferir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Recibir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
