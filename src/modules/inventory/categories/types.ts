export interface ProductCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  is_default: boolean;
  is_archived: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductCategoryInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProductCategoryInput {
  name?: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

export type ProductCategoryFilter = 'active' | 'archived' | 'all';
