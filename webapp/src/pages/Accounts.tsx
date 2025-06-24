import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CreditCard, PiggyBank, Eye, EyeOff } from "lucide-react";
import AccountCard from "../components/dashboard/AccountCard";
import TransferModal from "../components/dashboard/TransferModal";
import CreateAccountModal from "../components/accounts/CreateAccountModal";
import { useAuth } from "../contexts/AuthContext";
import { useBanking } from "../contexts/BankingContext";

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const { accounts } = useBanking();
  const [showBalance, setShowBalance] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const checkingAccounts = accounts.filter((acc) => acc.type === "checking");
  const savingsAccounts = accounts.filter((acc) => acc.type === "savings");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const handleTransferClick = (accountId?: string) => {
    if (accountId) {
      setSelectedAccountId(accountId);
    }
    setIsTransferModalOpen(true);
  };

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mis Cuentas
                  </h1>
                  <p className="text-gray-600">
                    Gestiona tus cuentas bancarias
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsCreateAccountModalOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cuenta
                </Button>
                <Button
                  onClick={() => handleTransferClick()}
                  className="banking-gradient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Transferir
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Balance Overview */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <CreditCard className="h-6 w-6" />
                      <span>Balance Total</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-white/20"
                    >
                      {showBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold balance-animation">
                    {showBalance ? formatCurrency(totalBalance) : "••••••••"}
                  </p>
                  <p className="text-blue-100 mt-2">
                    {accounts.length}{" "}
                    {accounts.length === 1
                      ? "cuenta activa"
                      : "cuentas activas"}
                  </p>
                </CardContent>
              </Card>

              {/* Accounts Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Todas las Cuentas</TabsTrigger>
                  <TabsTrigger value="checking">Cuentas Corrientes</TabsTrigger>
                  <TabsTrigger value="savings">Cajas de Ahorro</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        onTransfer={() => handleTransferClick(account.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="checking" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cuentas Corrientes
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(
                        checkingAccounts.reduce(
                          (sum, acc) => sum + acc.balance,
                          0
                        )
                      )}{" "}
                      total
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {checkingAccounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        onTransfer={() => handleTransferClick(account.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="savings" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cajas de Ahorro
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(
                        savingsAccounts.reduce(
                          (sum, acc) => sum + acc.balance,
                          0
                        )
                      )}{" "}
                      total
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savingsAccounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        onTransfer={() => handleTransferClick(account.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedAccountId("");
        }}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
      />

      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
      />
    </SidebarProvider>
  );
};

export default Accounts;
