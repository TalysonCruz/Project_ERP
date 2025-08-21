"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Calculator, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price?: number;
}

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface OrcamentoItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  availableStock: number;
}

interface OrcamentoIntegradoProps {
  onStatsUpdate?: () => void;
}

export function OrcamentoIntegrado({ onStatsUpdate }: OrcamentoIntegradoProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [observations, setObservations] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/product"),
        fetch("/api/admin/client"),
      ]);

      const [productsData, clientsData] = await Promise.all([
        productsRes.json(),
        clientsRes.json(),
      ]);

      setProducts(productsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id.toString() === clientId);
    setSelectedClient(client || null);
  };

  const addItemToOrcamento = () => {
    if (!currentProduct || !currentQuantity || !currentPrice) {
      toast.error("Preencha todos os campos do produto");
      return;
    }

    const product = products.find((p) => p.id.toString() === currentProduct);
    if (!product) return;

    const quantity = Number.parseInt(currentQuantity);
    const price = Number.parseFloat(currentPrice);

    // Verifica se há estoque suficiente
    if (quantity > product.quantity) {
      toast.error(`Estoque insuficiente. Disponível: ${product.quantity}`);
      return;
    }

    // Verifica se o produto já foi adicionado
    if (items.some((item) => item.id === product.id)) {
      toast.error("Produto já adicionado ao orçamento");
      return;
    }

    const newItem: OrcamentoItem = {
      id: product.id,
      name: product.name,
      quantity,
      price,
      total: quantity * price,
      availableStock: product.quantity,
    };

    setItems([...items, newItem]);
    setCurrentProduct("");
    setCurrentQuantity("");
    setCurrentPrice("");
  };

  const removeItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    const product = products.find((p) => p.id === itemId);
    if (!product) return;

    if (newQuantity > product.quantity) {
      toast.error(`Estoque insuficiente. Disponível: ${product.quantity}`);
      return;
    }

    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const updateItemPrice = (itemId: number, newPrice: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, price: newPrice, total: item.quantity * newPrice }
          : item
      )
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * discount) / 100;
  };

  const handleConfirmOrcamento = async () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente");
      return;
    }

    if (items.length === 0) {
      toast.error("Adicione pelo menos um item ao orçamento");
      return;
    }

    try {
      const orcamentoData = {
        clientId: selectedClient.id,
        items: items.map((item) => ({
          produtoId: item.id,
          quantity: item.quantity,
          preco: item.price,
        })),
        desconto: discount,
        frete: 0,
        observacoes: observations,
      };

      const orcamentoResponse = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orcamentoData),
      });

      if (!orcamentoResponse.ok) {
        const error = await orcamentoResponse.json();
        throw new Error(error.message);
      }

      const orcamento = await orcamentoResponse.json();

      toast.success(`Orçamento #${orcamento.numero} criado com sucesso!`);

      // Reset form
      setItems([]);
      setSelectedClient(null);
      setDiscount(0);
      setObservations("");

      // Reload data to update stock quantities
      loadData();
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar orçamento");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Criar Orçamento
          </CardTitle>
          <CardDescription>
            Crie orçamentos baseados nos produtos em estoque e confirme para
            movimentar automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Informações do Cliente
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={selectedClient?.id.toString() || ""}
                  onValueChange={handleClientSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="space-y-2">
                  <Label>Informações de Contato</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedClient.name}
                    </div>
                    {selectedClient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedClient.email}
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedClient.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Adicionar Produtos */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Adicionar Produtos
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select
                  value={currentProduct}
                  onValueChange={setCurrentProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(
                        (product) =>
                          !items.some((item) => item.id === product.id) &&
                          product.quantity > 0
                      )
                      .map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name} (Estoque: {product.quantity})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Preço Unitário (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  onClick={addItemToOrcamento}
                  className="w-full"
                  disabled={
                    !currentProduct || !currentQuantity || !currentPrice
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Itens */}
          {items.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Itens do Orçamento ({items.length})
              </Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.availableStock}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(
                                item.id,
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              updateItemPrice(
                                item.id,
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>R$ {item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Totais e Finalização */}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações sobre o orçamento..."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto ({discount}%):</span>
                        <span>
                          - R${" "}
                          {((calculateSubtotal() * discount) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmOrcamento}
                    className="w-full"
                    size="lg"
                    disabled={!selectedClient || items.length === 0}
                  >
                    Confirmar Orçamento e Movimentar Estoque
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
