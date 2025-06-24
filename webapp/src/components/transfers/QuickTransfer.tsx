import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Zap } from "lucide-react";
import { Account } from "../../types/banking";
import { useBanking } from "../../contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";

interface QuickTransferProps {
  accounts: Account[];
}

const QuickTransfer: React.FC<QuickTransferProps> = ({ accounts }) => {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const { transferMoney } = useBanking();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const handleQuickTransfer = () => {
    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (fromAccountId === toAccountId) {
      toast({
        title: "Error",
        description: "No puedes transferir a la misma cuenta",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Ingrese un monto válido",
        variant: "destructive",
      });
      return;
    }

    const success = transferMoney(
      fromAccountId,
      toAccountId,
      amountNum,
      "Transferencia rápida"
    );

    if (success) {
      toast({
        title: "Transferencia exitosa",
        description: `Se transfirieron ${formatCurrency(
          amountNum
        )} exitosamente`,
      });

      // Reset form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
    } else {
      toast({
        title: "Error en transferencia",
        description: "Saldo insuficiente o error en la operación",
        variant: "destructive",
      });
    }
  };

  const availableToAccounts = accounts.filter(
    (acc) => acc.id !== fromAccountId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Transferencia Rápida</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quickFromAccount">Cuenta origen</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta origen" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex flex-col">
                      <span>{account.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(account.balance)} -{" "}
                        {account.accountNumber}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quickToAccount">Cuenta destino</Label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta destino" />
              </SelectTrigger>
              <SelectContent>
                {availableToAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex flex-col">
                      <span>{account.name}</span>
                      <span className="text-xs text-gray-500">
                        {account.accountNumber}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quickAmount">Monto (ARS)</Label>
          <Input
            id="quickAmount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
        </div>

        <Button
          onClick={handleQuickTransfer}
          className="w-full banking-gradient"
          size="lg"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Transferir Ahora
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickTransfer;
