export interface SelectedItem {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  qtd: number; // Padronizando para usar apenas 'qtd'
}

export interface ClienteInfo {
  nomeCliente: string;
  atencao?: string;
  email?: string;
  telefone?: string;
}

export interface GerarPdfProps {
  itensSelecionados: Array<{
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
  }>;
  clienteInfo: {
    id: number;
    name: string;
    email: string;
    tel: string;
  };
  desconto: number;
  frete: number;
  orcamentoId?: number;
}
