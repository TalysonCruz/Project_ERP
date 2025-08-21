export interface InventoryItem {
  id: number;
  type: string;
  quantity: number;
  created_at: Date;
  produto: {
    id: number;
    name: string;
    quantity: number;
    barcode: string;
    category: {
      id: number;
      name: string;
    };
  };
  supplier?: {
    id: number;
    name: string;
    email: string;
    cnpj: string;
    tel: string;
  } | null;
  client?: {
    id: number;
    name: string;
    email: string;
    cnpj: string;
    tel: string;
  } | null;
}

export interface Produto {
  id: number;
  name: string;
  quantity: number;
  barcode: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  inventories: InventoryItem[];
}
