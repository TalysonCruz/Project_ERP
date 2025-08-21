"use client";

import type { InventoryItem } from "@/types/type";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, TrendingUp, TrendingDown, Search } from "lucide-react";
import { StockCalculator } from "@/components/stock-calculator";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entradaSearch, setEntradaSearch] = useState("");
  const [saidaSearch, setSaidaSearch] = useState("");

  useEffect(() => {
    const handleInventory = async () => {
      try {
        const response = await fetch("/api/inventory", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[v0] Erro na resposta:", errorText);
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setInventory(data);
        setError(null);
      } catch (error) {
        console.error("[v0] Erro ao carregar inventário:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };
    handleInventory();
  }, []);

  const entradaItems = inventory.filter((item) => item.type === "entrada");
  const saidaItems = inventory.filter((item) => item.type === "saida");

  const filteredEntradaItems = entradaItems.filter(
    (item) =>
      item.produto.name.toLowerCase().includes(entradaSearch.toLowerCase()) ||
      item.produto.category.name
        .toLowerCase()
        .includes(entradaSearch.toLowerCase()) ||
      item.supplier?.name.toLowerCase().includes(entradaSearch.toLowerCase())
  );

  const filteredSaidaItems = saidaItems.filter(
    (item) =>
      item.produto.name.toLowerCase().includes(saidaSearch.toLowerCase()) ||
      item.produto.category.name
        .toLowerCase()
        .includes(saidaSearch.toLowerCase()) ||
      item.client?.name.toLowerCase().includes(saidaSearch.toLowerCase())
  );

  const totalQuantityEntrada = entradaItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalQuantitySaida = saidaItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const uniqueProducts = new Set(inventory.map((item) => item.produto.id)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 animate-spin" />
          <span className="text-lg">Carregando inventário...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="text-xl font-semibold text-red-600">
            Erro ao carregar inventário
          </h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Package className="h-10 w-10 text-primary" />
            Sistema de Inventário
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie movimentações de estoque, entradas e saídas
          </p>
        </div>

        {/* Stock Calculator */}
        <StockCalculator />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos Únicos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entradas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalQuantityEntrada}
              </div>
              <p className="text-xs text-muted-foreground">
                {entradaItems.length} movimentações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Saídas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalQuantitySaida}
              </div>
              <p className="text-xs text-muted-foreground">
                {saidaItems.length} movimentações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalQuantityEntrada - totalQuantitySaida}
              </div>
              <p className="text-xs text-muted-foreground">
                Diferença entrada/saída
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Entradas Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Entradas de Estoque
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produto, categoria ou fornecedor..."
                value={entradaSearch}
                onChange={(e) => setEntradaSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredEntradaItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Código de Barras</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntradaItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.produto.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.produto.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.produto.barcode}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          +{item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.supplier?.name || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-600" />
                <p>
                  {entradaSearch
                    ? `Nenhuma entrada encontrada para "${entradaSearch}"`
                    : "Nenhuma entrada de estoque encontrada"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saídas Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Saídas de Estoque
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produto, categoria ou cliente..."
                value={saidaSearch}
                onChange={(e) => setSaidaSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredSaidaItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Código de Barras</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSaidaItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.produto.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.produto.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.produto.barcode}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-600"
                        >
                          -{item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.client?.name || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-600" />
                <p>
                  {saidaSearch
                    ? `Nenhuma saída encontrada para "${saidaSearch}"`
                    : "Nenhuma saída de estoque encontrada"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
