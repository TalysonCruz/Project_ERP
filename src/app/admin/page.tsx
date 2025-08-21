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
import { AdminLayout } from "@/components/admin/admin-layout";
import { ProductsManager } from "@/components/admin/products-manager";
import { ClientsManager } from "@/components/admin/clients-manager";
import { SuppliersManager } from "@/components/admin/suppliers-manager";
import { UsersManager } from "@/components/admin/users-manager";
import { InventoryManager } from "@/components/admin/inventory-manager";
import {
  Package,
  Users,
  Building2,
  UserCheck,
  BarChart3,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Stats {
  products: number;
  clients: number;
  suppliers: number;
  users: number;
  lowStockProducts: number;
}

export default function Admin() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    clients: 0,
    suppliers: 0,
    users: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

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

      const [productsRes, clientsRes, suppliersRes, usersRes] =
        await Promise.all([
          fetch("/api/admin/product"),
          fetch("/api/admin/client"),
          fetch("/api/admin/supplier"),
          fetch("/api/admin/users"),
        ]);

      const [products, clients, suppliers, users] = await Promise.all([
        productsRes.json(),
        clientsRes.json(),
        suppliersRes.json(),
        usersRes.json(),
      ]);

      const lowStockProducts = products.filter(
        (p: any) => p.quantity < 10
      ).length;

      setStats({
        products: products.length,
        clients: clients.length,
        suppliers: suppliers.length,
        users: users.length,
        lowStockProducts,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie seu sistema de inventário
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Bem-vindo, {userName}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.products}
              </div>
              <p className="text-xs text-muted-foreground">Total de produtos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.clients}
              </div>
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
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.suppliers}
              </div>
              <p className="text-xs text-muted-foreground">
                Fornecedores ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.users}
              </div>
              <p className="text-xs text-muted-foreground">
                Usuários do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {loading ? "..." : stats.lowStockProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos com estoque baixo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert for low stock */}
        {stats.lowStockProducts > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Produtos com Estoque Baixo
              </CardTitle>
              <CardDescription>
                Existem {stats.lowStockProducts} produtos com estoque abaixo de
                10 unidades. Considere reabastecer.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Inventário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
