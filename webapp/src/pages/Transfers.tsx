import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowLeftRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useBanking } from "../contexts/BankingContext";
import TransferModal from "../components/dashboard/TransferModal";
import TransferHistory from "../components/transfers/TransferHistory";
import QuickTransfer from "../components/transfers/QuickTransfer";

const Transfers: React.FC = () => {
  const { user } = useAuth();
  const { accounts, transactions } = useBanking();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Calculate transfer statistics
  const todayTransfers = transactions.filter((tx) => {
    const today = new Date();
    const txDate = new Date(tx.timestamp);
    return txDate.toDateString() === today.toDateString();
  });

  const thisMonthTransfers = transactions.filter((tx) => {
    const now = new Date();
    const txDate = new Date(tx.timestamp);
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });

  const totalTransferredThisMonth = thisMonthTransfers.reduce(
    (sum, tx) => sum + tx.amount,
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
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <ArrowLeftRight className="h-6 w-6" />
                    <span>Transferencias</span>
                  </h1>
                  <p className="text-gray-600">
                    Administra tus transferencias entre cuentas
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsTransferModalOpen(true)}
                className="banking-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transferencia
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Transferencias Hoy
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todayTransfers.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {todayTransfers.length > 0
                        ? `Última: ${todayTransfers[0]?.timestamp.toLocaleTimeString()}`
                        : "Sin transferencias hoy"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Este Mes
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {thisMonthTransfers.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(totalTransferredThisMonth)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Estado
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      Activo
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {accounts.length} cuentas disponibles
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Transfer Management Tabs */}
              <Tabs defaultValue="quick" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quick">Transferencia Rápida</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="space-y-4">
                  <QuickTransfer accounts={accounts} />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <TransferHistory
                    transactions={transactions}
                    accounts={accounts}
                    currentUserId={user?.id || ""}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
      />
    </SidebarProvider>
  );
};

export default Transfers;
