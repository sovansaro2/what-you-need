export interface InventoryProduct {
  id: string;
  user_id: string;
  name: string;
  unit: string;
  unit_id?: string | null;
  category: string;
  category_id?: string | null;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  image_url?: string | null;
  min_stock_alert?: number | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryProductInput {
  name: string;
  unit: string;
  unit_id?: string;
  category: string;
  category_id?: string;
  cost_price: number;
  selling_price: number;
  initial_stock?: number;
  sku?: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  min_stock_alert?: number;
}

export interface UpdateInventoryProductInput {
  name?: string;
  unit?: string;
  unit_id?: string;
  category?: string;
  category_id?: string;
  cost_price?: number;
  selling_price?: number;
  sku?: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  min_stock_alert?: number;
  is_archived?: boolean;
}

export type ProductStockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived';

export interface ProductFilter {
  status?: ProductStockStatus;
  category?: string;
  unit?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'created_at' | 'selling_price' | 'current_stock';
  sortOrder?: 'asc' | 'desc';
}
