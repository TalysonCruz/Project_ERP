"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, TrendingUp, Package, LogOut } from "lucide-react";
import { VendedorClients } from "@/components/vendedor/vendedor-clients";
import { VendedorSuppliers } from "@/components/vendedor/vendedor-suppliers";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import type { Orcamento } from "@prisma/client";

export default function VendedorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    clients: 0,
    suppliers: 0,
    products: 0,
    recentSales: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const name = Cookies.get("name");
        if (name) setUserName(name);
        const [clientsRes, suppliersRes, orcamentoStatus] = await Promise.all([
          fetch("/api/vendedor/client"),
          fetch("/api/vendedor/supplier"),
          fetch("/api/orcamento"),
        ]);

        const clients = await clientsRes.json();
        const suppliers = await suppliersRes.json();
        const orcamentos: Orcamento[] = await orcamentoStatus.json();

        const confirmados = orcamentos.filter(
          (o: any) => o.status === "CONFIRMADO"
        ).length;
        setStats({
          clients: clients.length,
          suppliers: suppliers.length,
          products: 0,
          recentSales: confirmados,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("name");

    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  const handleStatsUpdate = () => {
    const fetchStats = async () => {
      try {
        const [clientsRes, suppliersRes] = await Promise.all([
          fetch("/api/vendedor/client"),
          fetch("/api/vendedor/supplier"),
          fetch("/api/orcamento"),
        ]);

        const clients = await clientsRes.json();
        const suppliers = await suppliersRes.json();

        setStats({
          clients: clients.length,
          suppliers: suppliers.length,
          products: 0,
          recentSales: 0,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Vendedor
            </h1>
            <p className="text-slate-600 mt-1">
              Acesse informações de clientes e fornecedores
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-sm px-3 py-1 border-blue-200 text-blue-700"
            >
              Bem Vindo, {userName}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <p className="text-xs text-muted-foreground">
                Fornecedores ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas do Mês
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentSales}</div>
              <p className="text-xs text-muted-foreground">Vendas realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bem-vindo ao Sistema de Vendas
            </CardTitle>
            <CardDescription className="text-blue-700">
              Acesse informações de clientes e fornecedores para otimizar suas
              vendas
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Management Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="inventory">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <VendedorClients onStatsUpdate={handleStatsUpdate} />
          </TabsContent>

          <TabsContent value="suppliers">
            <VendedorSuppliers onStatsUpdate={handleStatsUpdate} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager onStatsUpdate={handleStatsUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
