"use client";

import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable, {
  type FontStyle,
  type HAlignType,
  type HookData,
} from "jspdf-autotable";
import type { SelectedItem, ClienteInfo } from "@/types/pdf";
import {
  calculateUnitValue,
  generateProductDescription,
  formatCurrency,
  getCurrentDate,
  calculateTotals,
} from "@/utils/pdf-calculations";
import { PDF_STYLES, COMPANY_INFO } from "@/constants/pdf-config";

interface UsePdfGeneratorProps {
  itensSelecionados: SelectedItem[];
  clienteInfo: ClienteInfo;
  desconto: number;
  frete: number;
  orcamentoId: number;
}

export const usePdfGenerator = ({
  itensSelecionados,
  clienteInfo,
  desconto,
  frete,
  orcamentoId,
}: UsePdfGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const addCompanyHeader = useCallback((doc: jsPDF, pageWidth: number) => {
    let currentY = 10;

    try {
      currentY = Math.max(currentY, 40);
    } catch (e) {
      console.error("Erro ao adicionar logo:", e);
      currentY = Math.max(currentY, 40);
    }

    const textX = pageWidth - PDF_STYLES.pageMargin;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const companyLines = [
      COMPANY_INFO.nome,
      COMPANY_INFO.endereco,
      COMPANY_INFO.cidade,
      COMPANY_INFO.cnpj,
      `Data: ${getCurrentDate()}`,
    ];

    companyLines.forEach((line, index) => {
      doc.text(line, textX, 20 + index * 7, { align: "right" });
    });

    return Math.max(currentY, 58);
  }, []);

  const addClientInfo = useCallback(
    (doc: jsPDF, startY: number) => {
      let currentY = Math.max(startY, 70);

      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);

      const clientLines = [
        `De: ${COMPANY_INFO.nome}`,
        `Contato: ${COMPANY_INFO.contato}`,
        `Para: ${clienteInfo.nomeCliente || "Não Informado"}`,
        `A/C: ${clienteInfo.atencao || "Não Informado"}`,
        `Orçamento ID: ${orcamentoId}`,
      ];

      clientLines.forEach((line) => {
        doc.text(line, PDF_STYLES.pageMargin, currentY);
        currentY += 7;
      });

      return currentY + 15;
    },
    [clienteInfo, orcamentoId]
  );

  const generateTableData = useCallback(() => {
    const tableRows: string[][] = [];

    itensSelecionados.forEach((item, index) => {
      try {
        const valorUnitario = calculateUnitValue(item);
        const qtd = Number(item.qtd) || 0;
        const totalItem = valorUnitario * qtd;

        if (qtd > 0 && valorUnitario >= 0) {
          tableRows.push([
            (index + 1).toString(),
            "", // Referência
            generateProductDescription(item),
            qtd.toString(),
            formatCurrency(valorUnitario),
            formatCurrency(totalItem),
          ]);
        }
      } catch (err) {
        console.warn(`Item ${index + 1} ignorado por falta de dados:`, err);
      }
    });

    return tableRows;
  }, [itensSelecionados]);

  const generateTableFooter = useCallback(() => {
    const { descontoAplicado, totalFinal } = calculateTotals(
      itensSelecionados,
      desconto,
      frete
    );

    return [
      [
        {
          content: "FRETE",
          colSpan: 5,
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
          },
        },
        {
          content: formatCurrency(frete),
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
          },
        },
      ],
      [
        {
          content: `DESCONTO (${desconto}%)`,
          colSpan: 5,
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
          },
        },
        {
          content: formatCurrency(descontoAplicado),
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
          },
        },
      ],
      [
        {
          content: "TOTAL GERAL",
          colSpan: 5,
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
            fontSize: PDF_STYLES.total.size,
            textColor: PDF_STYLES.total.color,
          },
        },
        {
          content: formatCurrency(totalFinal),
          styles: {
            halign: "right" as HAlignType,
            fontStyle: "bold" as FontStyle,
            fontSize: PDF_STYLES.total.size,
            textColor: PDF_STYLES.total.color,
          },
        },
      ],
    ];
  }, [itensSelecionados, desconto, frete]);

  const generatePdf = useCallback(async () => {
    if (itensSelecionados.length === 0) {
      throw new Error("Nenhum item selecionado para gerar o PDF");
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

      // Header da empresa
      let currentY = addCompanyHeader(doc, pageWidth);

      // Informações do cliente
      currentY = addClientInfo(doc, currentY);

      // Título
      doc.setFontSize(14);
      doc.text("Proposta Comercial", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 10;

      // Tabela
      const tableRows = generateTableData();
      const tableFoot = generateTableFooter();

      if (tableRows.length === 0) {
        throw new Error("Nenhum item válido encontrado para gerar o PDF");
      }

      autoTable(doc, {
        head: [
          {
            id: "ID",
            referencia: "Referência",
            descricao: "Descrição",
            qtd: "Qtd.",
            valor_unitario: "Valor Unitário (R$)",
            total: "Total (R$)",
          },
        ],
        body: tableRows,
        foot: tableFoot,
        startY: currentY,
        headStyles: PDF_STYLES.tableHeader,
        alternateRowStyles: PDF_STYLES.alternateRow,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "middle",
        },
        columnStyles: {
          id: { cellWidth: 15, halign: "center" },
          referencia: { cellWidth: 25 },
          descricao: { cellWidth: "auto" },
          qtd: { cellWidth: 20, halign: "center" },
          valor_unitario: { cellWidth: 30, halign: "right" },
          total: { cellWidth: 30, halign: "right" },
        },
        footStyles: {
          fillColor: [248, 249, 250],
          textColor: [50, 50, 50],
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        didDrawPage: (data: HookData) => {
          const currentPage = data.pageNumber;
          const totalPages = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(
            `Página ${currentPage} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Para dúvidas ou alterações, entre em contato: ${COMPANY_INFO.email} | ${COMPANY_INFO.telefone}`,
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" }
      );

      const fileName = `Orcamento_${
        clienteInfo.nomeCliente?.replace(/[^a-zA-Z0-9]/g, "_") || "SemNome"
      }_${orcamentoId}.pdf`;

      doc.save(fileName);
      return doc;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [
    itensSelecionados,
    clienteInfo,
    orcamentoId,
    addCompanyHeader,
    addClientInfo,
    generateTableData,
    generateTableFooter,
  ]);

  const sendPdfByEmail = useCallback(
    async (email: string) => {
      setIsGenerating(true);

      try {
        const doc = await generatePdf();
        const pdfBase64 = doc.output("datauristring").split(",")[1];

        const response = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: `Orçamento #${orcamentoId} - ${clienteInfo.nomeCliente}`,
            message: `Segue em anexo o orçamento solicitado.<br><br>Atenciosamente,<br>${COMPANY_INFO.nome}`,
            attachment: {
              filename: `Orcamento_${orcamentoId}.pdf`,
              content: pdfBase64,
            },
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || "Erro ao enviar email");
        }

        return result;
      } catch (error) {
        console.error("Erro ao enviar PDF por email:", error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [generatePdf, orcamentoId, clienteInfo.nomeCliente]
  );

  return {
    isGenerating,
    generatePdf,
    sendPdfByEmail,
    totals: calculateTotals(itensSelecionados, desconto, frete),
  };
};
