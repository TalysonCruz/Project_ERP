"use client";

import type React from "react";

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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  X,
  ShoppingCart,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { OrcamentoIntegrado } from "../orcamento-integrado";
import OrcamentosList from "../orcamentos-list";

interface InventoryMovement {
  id: number;
  type: string;
  quantity: number;
  created_at: string;
  produto: {
    id: number;
    name: string;
    barcode: string;
    category: {
      name: string;
    };
  };
  client?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
}

interface Product {
  id: number;
  name: string;
  quantity: number;
}

interface Client {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface SelectedProduct {
  id: number;
  name: string;
  quantity: number;
  currentStock: number;
}

interface InventoryManagerProps {
  onStatsUpdate: () => void;
}

export function InventoryManager({ onStatsUpdate }: InventoryManagerProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    supplierId: "",
    clientId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsRes, productsRes, clientsRes, suppliersRes] =
        await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/admin/product"),
          fetch("/api/admin/client"),
          fetch("/api/admin/supplier"),
        ]);

      const [movementsData, productsData, clientsData, suppliersData] =
        await Promise.all([
          movementsRes.json(),
          productsRes.json(),
          clientsRes.json(),
          suppliersRes.json(),
        ]);

      setMovements(movementsData);
      setProducts(productsData);
      setClients(clientsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar movimentações");
    } finally {
      setLoading(false);
    }
  };

  const addProductToList = () => {
    if (!currentProduct || !currentQuantity) {
      toast.error("Selecione um produto e informe a quantidade");
      return;
    }

    const product = products.find((p) => p.id.toString() === currentProduct);
    if (!product) return;

    // Verifica se o produto já foi adicionado
    if (selectedProducts.some((p) => p.id === product.id)) {
      toast.error("Produto já adicionado à lista");
      return;
    }

    const newProduct: SelectedProduct = {
      id: product.id,
      name: product.name,
      quantity: Number.parseInt(currentQuantity),
      currentStock: product.quantity,
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setCurrentProduct("");
    setCurrentQuantity("");
  };

  const removeProductFromList = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("Adicione pelo menos um produto à movimentação");
      return;
    }

    try {
      // Envia uma movimentação para cada produto selecionado
      const promises = selectedProducts.map((product) =>
        fetch("/api/inventory/movement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            produtoId: product.id,
            quantity: product.quantity,
            type: formData.type,
            supplierId: formData.supplierId
              ? Number.parseInt(formData.supplierId)
              : null,
            clientId: formData.clientId
              ? Number.parseInt(formData.clientId)
              : null,
          }),
        })
      );

      const responses = await Promise.all(promises);

      // Verifica se todas as requisições foram bem-sucedidas
      for (const response of responses) {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
      }

      toast.success(
        `${selectedProducts.length} movimentações registradas com sucesso!`
      );
      setIsDialogOpen(false);
      resetForm();
      loadData();
      onStatsUpdate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar movimentações");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      supplierId: "",
      clientId: "",
    });
    setSelectedProducts([]);
    setCurrentProduct("");
    setCurrentQuantity("");
  };

  const getMovementBadge = (type: string) => {
    return type === "entrada" ? (
      <Badge variant="default" className="flex items-center gap-1 w-fit">
        <TrendingUp className="h-3 w-3" />
        Entrada
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <TrendingDown className="h-3 w-3" />
        Saída
      </Badge>
    );
  };

  const filteredMovements = movements.filter(
    (movement) =>
      movement.produto?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.produto?.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Movimentação de Inventário
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Criar Orçamento
          </TabsTrigger>
          <TabsTrigger
            value="orcamentos-list"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Gerenciar Orçamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gerenciar Inventário
                  </CardTitle>
                  <CardDescription>
                    Registre movimentações de entrada e saída para múltiplos
                    produtos
                  </CardDescription>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Nova Movimentação Múltipla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Movimentação Múltipla</DialogTitle>
                      <DialogDescription>
                        Registre entrada ou saída para múltiplos produtos de uma
                        vez
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo de Movimentação</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                type: value,
                                supplierId: "",
                                clientId: "",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.type === "entrada" && (
                          <div className="space-y-2">
                            <Label htmlFor="supplier">
                              Fornecedor (Opcional)
                            </Label>
                            <Select
                              value={formData.supplierId}
                              onValueChange={(value) =>
                                setFormData({ ...formData, supplierId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um fornecedor" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map((supplier) => (
                                  <SelectItem
                                    key={supplier.id}
                                    value={supplier.id.toString()}
                                  >
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {formData.type === "saida" && (
                          <div className="space-y-2">
                            <Label htmlFor="client">Cliente (Opcional)</Label>
                            <Select
                              value={formData.clientId}
                              onValueChange={(value) =>
                                setFormData({ ...formData, clientId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem
                                    key={client.id}
                                    value={client.id.toString()}
                                  >
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <Label className="text-base font-semibold">
                            Adicionar Produtos
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                            <div className="space-y-2">
                              <Label htmlFor="produto">Produto</Label>
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
                                        !selectedProducts.some(
                                          (p) => p.id === product.id
                                        )
                                    )
                                    .map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id.toString()}
                                      >
                                        {product.name} (Estoque:{" "}
                                        {product.quantity})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantidade</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={currentQuantity}
                                onChange={(e) =>
                                  setCurrentQuantity(e.target.value)
                                }
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>&nbsp;</Label>
                              <Button
                                type="button"
                                onClick={addProductToList}
                                className="w-full"
                                disabled={!currentProduct || !currentQuantity}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </div>

                        {selectedProducts.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-base font-semibold">
                              Produtos Selecionados ({selectedProducts.length})
                            </Label>
                            <div className="border rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Estoque Atual</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                      <TableCell className="font-medium">
                                        {product.name}
                                      </TableCell>
                                      <TableCell>
                                        {product.currentStock}
                                      </TableCell>
                                      <TableCell>{product.quantity}</TableCell>
                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeProductFromList(product.id)
                                          }
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
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            selectedProducts.length === 0 || !formData.type
                          }
                        >
                          Registrar {selectedProducts.length} Movimentações
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimentações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {loading ? (
                <div className="text-center py-4">
                  Carregando movimentações...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Origem/Destino</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {movement.produto?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {movement.produto?.category?.name || "N/A"}
                        </TableCell>
                        <TableCell>{getMovementBadge(movement.type)}</TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>
                          {movement.type === "entrada"
                            ? movement.supplier?.name || "Entrada manual"
                            : movement.client?.name || "Saída manual"}
                        </TableCell>
                        <TableCell>
                          {new Date(movement.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamento" className="space-y-4">
          <OrcamentoIntegrado onStatsUpdate={onStatsUpdate} />
        </TabsContent>

        <TabsContent value="orcamentos-list" className="space-y-4">
          <OrcamentosList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
