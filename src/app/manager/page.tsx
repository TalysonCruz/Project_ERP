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
import {
  Package,
  Users,
  Truck,
  AlertTriangle,
  DollarSign,
  LogOut,
} from "lucide-react";
import { ProductsManager } from "@/components/admin/products-manager";
import { ManagerClients } from "@/components/manager/manager-clients";
import { SuppliersManager } from "@/components/manager/suppliers-manager";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { UsersManager } from "@/components/manager/users-manager";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    clients: 0,
    suppliers: 0,
    vendedores: 0,
    lowStock: 0,
    totalValue: 0,
  });
  const router = useRouter();
  const [userName, setUserName] = useState("");

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("name");

    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  const loadStats = async () => {
    try {
      const name = Cookies.get("name");
      if (name) setUserName(name);
      const [productsRes, clientsRes, suppliersRes, vendedoresRes] =
        await Promise.all([
          fetch("/api/manager/product"),
          fetch("/api/manager/client"),
          fetch("/api/manager/supplier"),
          fetch("/api/manager/users"),
        ]);

      const products = await productsRes.json();
      const clients = await clientsRes.json();
      const suppliers = await suppliersRes.json();
      const vendedores = await vendedoresRes.json();

      const lowStockProducts = products.filter((p: any) => p.quantity < 10);
      const totalValue = products.reduce(
        (sum: number, p: any) => sum + (p.price || 0) * p.quantity,
        0
      );

      setStats({
        products: products.length,
        clients: clients.length,
        suppliers: suppliers.length,
        vendedores: vendedores.length,
        lowStock: lowStockProducts.length,
        totalValue,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Manager
            </h1>
            <p className="text-slate-600 mt-1">
              Gerencie produtos, clientes, fornecedores e vendedores
            </p>
          </div>
          <div className="items-center flex gap-2">
            <Badge variant="secondary" className="text-xl px-3 py-1 ">
              Bem Vindo, {userName}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vendedores}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lowStock}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {stats.totalValue.toLocaleString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for Low Stock */}
        {stats.lowStock > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Produtos com Estoque Baixo
              </CardTitle>
              <CardDescription className="text-orange-700">
                {stats.lowStock} produto(s) com menos de 10 unidades em estoque
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="clients">
            <ManagerClients onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="vendedores">
            <UsersManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
