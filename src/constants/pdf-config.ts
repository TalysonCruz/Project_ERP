export const PDF_STYLES = {
  pageMargin: 20,
  tableHeader: {
    fillColor: [52, 58, 64] as [number, number, number],
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: "bold" as const,
    fontSize: 10,
  },
  alternateRow: {
    fillColor: [248, 249, 250] as [number, number, number],
  },
  total: {
    size: 12,
    color: [220, 53, 69] as [number, number, number],
  },
};

export const COMPANY_INFO = {
  nome: "Sua Empresa LTDA",
  endereco: "Rua Exemplo, 123",
  cidade: "Cidade - Estado, CEP 12345-678",
  cnpj: "CNPJ: 12.345.678/0001-90",
  contato: "contato@suaempresa.com",
  email: "contato@suaempresa.com",
  telefone: "(11) 99999-9999",
};
