export interface ProductUnit {
  id: string;
  user_id: string;
  name: string;
  symbol?: string | null;
  description?: string | null;
  is_default: boolean;
  is_archived: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductUnitInput {
  name: string;
  symbol?: string;
  description?: string;
}

export interface UpdateProductUnitInput {
  name?: string;
  symbol?: string;
  description?: string;
  is_archived?: boolean;
}

export type ProductUnitFilter = 'active' | 'archived' | 'all';
