"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, TrendingUp, TrendingDown } from "lucide-react";

interface StockData {
  productId: number;
  saldoAtual: number;
  totalMovimentacoes: number;
  historico: Array<{
    tipo: string;
    quantidade: number;
    saldoApos: number;
    data: string;
  }>;
}

export function StockCalculator() {
  const [productId, setProductId] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);

  const calcularEstoque = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/product/${productId}/stock`);
      const data = await response.json();

      if (response.ok) {
        setStockData(data);
      } else {
        console.error("Erro:", data.message);
      }
    } catch (error) {
      console.error("Erro ao calcular estoque:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Estoque
          </CardTitle>
          <CardDescription>
            Digite o ID do produto para ver o saldo atual baseado nas
            movimentações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="ID do Produto"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <Button onClick={calcularEstoque} disabled={loading}>
              {loading ? "Calculando..." : "Calcular"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stockData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produto #{stockData.productId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stockData.saldoAtual}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Atual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stockData.totalMovimentacoes}
                </div>
                <div className="text-sm text-muted-foreground">
                  Movimentações
                </div>
              </div>
              <div className="text-center">
                <Badge
                  variant={stockData.saldoAtual > 0 ? "default" : "destructive"}
                >
                  {stockData.saldoAtual > 0 ? "Em Estoque" : "Sem Estoque"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Histórico de Movimentações:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {stockData.historico.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {item.tipo.toLowerCase().includes("entrada") ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">{item.tipo}</span>
                      <Badge variant="outline">{item.quantidade}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        Saldo: {item.saldoApos}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.data).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
