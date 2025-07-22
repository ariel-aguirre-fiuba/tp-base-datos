import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Account } from "../../types/banking";
import { useBanking } from "../../contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  selectedAccountId?: string;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  selectedAccountId,
}) => {
  const [fromAccountId, setFromAccountId] = useState<number | null>();
  const [toAccountId, setToAccountId] = useState<number | null>();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { transferMoney } = useBanking();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccountId || !toAccountId || !amount || !description) {
      setError("Por favor complete todos los campos");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("No puedes transferir a la misma cuenta");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Ingrese un monto válido");
      return;
    }

    const fromAccount = accounts.find((acc: any) => acc.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amountNum) {
      setError("Saldo insuficiente");
      return;
    }

    const success = await transferMoney(
      fromAccountId,
      toAccountId,
      amountNum,
      description
    );

    if (success) {
      toast({
        title: "Transferencia exitosa",
        description: `Se transfirieron ${formatCurrency(
          amountNum
        )} exitosamente`,
      });

      // Reset form
      setFromAccountId(null);
      setToAccountId(null);
      setAmount("");
      setDescription("");
      onClose();
    } else {
      setError("Error al procesar la transferencia");
      toast({
        title: "Error en transferencia",
        description: "No se pudo procesar la transferencia",
        variant: "destructive",
      });
    }
  };

  const availableToAccounts = accounts.filter(
    (acc) => acc.id !== fromAccountId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowRight className="h-5 w-5" />
            <span>Nueva Transferencia</span>
          </DialogTitle>
          <DialogDescription>
            Transfiere dinero entre tus cuentas de forma segura
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">Cuenta origen</Label>
            <Select
              value={fromAccountId}
              onValueChange={(accountId) => setFromAccountId(+accountId)}
            >
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
            <Label htmlFor="toAccount">Cuenta destino</Label>
            <Select
              value={toAccountId}
              onValueChange={(accountId) => setToAccountId(+accountId)}
            >
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

          <div className="space-y-2">
            <Label htmlFor="amount">Monto (ARS)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Concepto de la transferencia"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 banking-gradient">
              Transferir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
