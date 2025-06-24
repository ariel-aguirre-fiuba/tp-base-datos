import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, EyeOff, TrendingUp, Wallet } from "lucide-react";
import AccountCard from "./AccountCard";
import TransactionList from "./TransactionList";
import TransferModal from "./TransferModal";
import { useAuth } from "../../contexts/AuthContext";
import { useBanking } from "../../contexts/BankingContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { accounts, transactions } = useBanking();
  const [showBalance, setShowBalance] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

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
                    ¡Hola, {user?.firstName}!
                  </h1>
                  <p className="text-gray-600">
                    Bienvenido a tu dashboard bancario
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleTransferClick()}
                className="banking-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transferencia
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Balance Overview */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Wallet className="h-6 w-6" />
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
                  <div className="space-y-2">
                    <p className="text-3xl font-bold balance-animation">
                      {showBalance ? formatCurrency(totalBalance) : "••••••••"}
                    </p>
                    <div className="flex items-center space-x-2 text-green-200">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+2.5% este mes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accounts Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mis Cuentas
                  </h2>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuenta
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onTransfer={() => handleTransferClick(account.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <TransactionList
                transactions={transactions}
                accounts={accounts}
                currentUserId={user?.id || ""}
              />
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
    </SidebarProvider>
  );
};

export default Dashboard;
