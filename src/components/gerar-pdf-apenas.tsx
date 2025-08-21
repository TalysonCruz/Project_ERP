"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GerarPdfProps } from "@/types/pdf";
import { usePdfGenerator } from "@/hooks/use-pdf-generator";
import { Mail, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GerarPdfApenas: React.FC<GerarPdfProps> = ({
  itensSelecionados,
  clienteInfo,
  desconto,
  frete = 0,
  orcamentoId = 1,
}) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const itensMapeados = itensSelecionados.map((item) => ({
    id: item.id,
    nome: item.produto.name,
    descricao: item.produto.category.name,
    preco: item.preco,
    qtd: item.quantity,
  }));

  const clienteMapeado = {
    nomeCliente: clienteInfo.name,
    atencao: clienteInfo.name,
    email: clienteInfo.email,
    telefone: clienteInfo.tel,
  };

  const { isGenerating, generatePdf, sendPdfByEmail } = usePdfGenerator({
    itensSelecionados: itensMapeados,
    clienteInfo: clienteMapeado,
    desconto,
    frete,
    orcamentoId,
  });

  const handleGeneratePdf = async () => {
    try {
      await generatePdf();
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Verifique os dados e tente novamente.");
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    try {
      await sendPdfByEmail(email);
      setIsEmailDialogOpen(false);
      setEmail("");
      toast.success("Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Tente novamente.");
    }
  };

  const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex gap-3">
        <Button
          onClick={handleGeneratePdf}
          disabled={isGenerating || itensSelecionados.length === 0}
          className="flex items-center gap-2"
          variant="default"
        >
          {isGenerating ? <LoadingSpinner /> : <Download className="h-4 w-4" />}
          {isGenerating ? "Gerando..." : "Gerar PDF"}
        </Button>

        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isGenerating || itensSelecionados.length === 0}
              variant="outline"
              className="flex items-center gap-2 bg-white/70"
            >
              <Mail className="h-4 w-4" />
              Enviar por Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Orçamento por Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email do destinatário</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEmailDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={isGenerating || !email.trim()}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <LoadingSpinner />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {isGenerating ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GerarPdfApenas;
