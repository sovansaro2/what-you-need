export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  unit?: string | null;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  min_stock_alert?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductInput {
  user_id: string;
  name: string;
  description?: string;
  unit?: string;
  cost_price: number;
  selling_price: number;
  current_stock?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  min_stock_alert?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  current_stock?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  min_stock_alert?: number;
}

export type StockTransactionType = 'in' | 'out' | 'adjustment';

export interface StockTransaction {
  id: string;
  user_id: string;
  product_id: string;
  type: StockTransactionType;
  quantity: number;
  cost_price: number;
  note?: string | null;
  transaction_date: string;
  created_at?: string;
  product?: Product;
}

export interface CreateStockTransactionInput {
  user_id: string;
  product_id: string;
  type: StockTransactionType;
  quantity: number;
  cost_price: number;
  note?: string;
  transaction_date?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  cost_price: number;
  profit: number;
  product?: Product;
}

export interface Sale {
  id: string;
  user_id: string;
  total_amount: number;
  total_profit: number;
  sale_date: string;
  note?: string | null;
  created_at?: string;
  items?: SaleItem[];
}

export interface CreateSaleItemInput {
  product_id: string;
  quantity: number;
  selling_price: number;
  cost_price: number;
}

export interface CreateSaleInput {
  user_id: string;
  total_amount: number;
  total_profit: number;
  sale_date?: string;
  note?: string;
  items: CreateSaleItemInput[];
}
