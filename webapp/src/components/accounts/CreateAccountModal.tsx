import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, PiggyBank } from "lucide-react";
import { useBanking } from "../../contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createAccount } = useBanking();
  const { toast } = useToast();
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">(
    "checking"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre para la cuenta",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      createAccount(accountType, accountName.trim());
      toast({
        title: "¡Cuenta creada!",
        description: `Tu nueva ${
          accountType === "checking" ? "cuenta corriente" : "caja de ahorro"
        } ha sido creada exitosamente.`,
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          "No se pudo crear la cuenta. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAccountName("");
    setAccountType("checking");
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nombre de la Cuenta</Label>
            <Input
              id="accountName"
              placeholder="Ej: Mi Cuenta de Ahorros"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>Tipo de Cuenta</Label>
            <RadioGroup
              value={accountType}
              onValueChange={(value) =>
                setAccountType(value as "checking" | "savings")
              }
              disabled={isLoading}
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="checking" id="checking" />
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="checking" className="font-medium">
                    Cuenta Corriente
                  </Label>
                  <p className="text-sm text-gray-600">
                    Para uso diario y transacciones frecuentes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="savings" id="savings" />
                <PiggyBank className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <Label htmlFor="savings" className="font-medium">
                    Caja de Ahorro
                  </Label>
                  <p className="text-sm text-gray-600">
                    Para ahorrar y generar intereses
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !accountName.trim()}
              className="flex-1 banking-gradient"
            >
              {isLoading ? "Creando..." : "Crear Cuenta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountModal;
