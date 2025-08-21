import type { SelectedItem } from "@/types/pdf";

export const calculateUnitValue = (item: SelectedItem): number => {
  const preco = Number(item.preco);
  return isNaN(preco) ? 0 : preco;
};

export const generateProductDescription = (item: SelectedItem): string => {
  return `${item.nome || "Produto"} - ${item.descricao || "Sem descrição"}`;
};

export const formatCurrency = (value: number): string => {
  const numValue = Number(value);
  if (isNaN(numValue)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
};

export const getCurrentDate = (): string => {
  return new Date().toLocaleDateString("pt-BR");
};

export const calculateTotals = (
  items: SelectedItem[],
  desconto: number,
  frete: number
) => {
  const subtotal = items.reduce((acc, item) => {
    const preco = Number(item.preco) || 0;
    const qtd = Number(item.qtd) || 0;
    return acc + preco * qtd;
  }, 0);

  const descontoNum = Number(desconto) || 0;
  const freteNum = Number(frete) || 0;
  const descontoAplicado = (subtotal * descontoNum) / 100;
  const totalFinal = subtotal - descontoAplicado + freteNum;

  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    descontoAplicado: isNaN(descontoAplicado) ? 0 : descontoAplicado,
    totalFinal: isNaN(totalFinal) ? 0 : totalFinal,
  };
};
