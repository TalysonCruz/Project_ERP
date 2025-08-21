"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import GerarPdfApenas from "./gerar-pdf-apenas";

interface OrcamentoItem {
  id: number;
  quantity: number;
  preco: number;
  subtotal: number;
  produto: {
    id: number;
    name: string;
    category: {
      name: string;
    };
  };
}

interface Orcamento {
  id: number;
  numero: string;
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  desconto: number;
  frete: number;
  total: number;
  observacoes?: string;
  created_at: string;
  client: {
    id: number;
    name: string;
    email: string;
    tel: string;
  };
  items: OrcamentoItem[];
}

export default function OrcamentosList() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    desconto: 0,
    frete: 0,
    observacoes: "",
  });

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch("/api/orcamento");
      if (response.ok) {
        const data = await response.json();
        setOrcamentos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "CONFIRMADO":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleView = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setEditForm({
      status: orcamento.status,
      desconto: orcamento.desconto,
      frete: orcamento.frete,
      observacoes: orcamento.observacoes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrcamento = async () => {
    if (!selectedOrcamento) return;

    try {
      const response = await fetch(`/api/orcamento/${selectedOrcamento.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Orçamento atualizado com sucesso!");
        setIsEditDialogOpen(false);
        fetchOrcamentos();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao atualizar orçamento");
      }
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
      toast.error("Erro ao atualizar orçamento");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orçamentos</h2>
        <div className="text-sm text-gray-600">
          Total: {orcamentos.length} orçamentos
        </div>
      </div>

      <div className="grid gap-4">
        {orcamentos.map((orcamento) => (
          <Card
            key={orcamento.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Orçamento #{orcamento.numero}
                </CardTitle>
                {getStatusBadge(orcamento.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{orcamento.client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium">
                    {formatDate(orcamento.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium text-lg text-green-600">
                    {formatCurrency(orcamento.total)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(orcamento)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(orcamento)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <GerarPdfApenas
                  itensSelecionados={orcamento.items}
                  clienteInfo={orcamento.client}
                  desconto={orcamento.desconto}
                  frete={orcamento.frete}
                  orcamentoId={orcamento.id}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orçamento #{selectedOrcamento?.numero}</DialogTitle>
          </DialogHeader>
          {selectedOrcamento && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                  <p>
                    <strong>Nome:</strong> {selectedOrcamento.client.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrcamento.client.email}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {selectedOrcamento.client.tel}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Informações do Orçamento
                  </h3>
                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedOrcamento.status)}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {formatDate(selectedOrcamento.created_at)}
                  </p>
                  <p>
                    <strong>Total:</strong>{" "}
                    {formatCurrency(selectedOrcamento.total)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Itens do Orçamento</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrcamento.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.produto.name}</TableCell>
                        <TableCell>{item.produto.category.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.preco)}</TableCell>
                        <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end space-y-1 text-sm">
                  <div className="text-right">
                    <p>
                      Subtotal:{" "}
                      {formatCurrency(
                        selectedOrcamento.items.reduce(
                          (acc, item) => acc + item.subtotal,
                          0
                        )
                      )}
                    </p>
                    <p>
                      Desconto: -{formatCurrency(selectedOrcamento.desconto)}
                    </p>
                    <p>Frete: {formatCurrency(selectedOrcamento.frete)}</p>
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(selectedOrcamento.total)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrcamento.observacoes && (
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-gray-700">
                    {selectedOrcamento.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Orçamento #{selectedOrcamento?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desconto">Desconto (R$)</Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  value={editForm.desconto}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      desconto: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="frete">Frete (R$)</Label>
                <Input
                  id="frete"
                  type="number"
                  step="0.01"
                  value={editForm.frete}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      frete: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={editForm.observacoes}
                onChange={(e) =>
                  setEditForm({ ...editForm, observacoes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateOrcamento}>Salvar Alterações</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
