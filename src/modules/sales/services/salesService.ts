import { supabase } from '@/lib/supabase';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

const PRODUCT_STORAGE_PREFIX = 'wyn_products_';

const getLocalProducts = (userId: string): Product[] => {
  try {
    const raw = localStorage.getItem(`${PRODUCT_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalProducts = (userId: string, products: Product[]): void => {
  try {
    localStorage.setItem(`${PRODUCT_STORAGE_PREFIX}${userId}`, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to save products to localStorage:', err);
  }
};

export const salesService = {
  /**
   * Fetch all products for a specific user ID.
   */
  async getProducts(userId: string): Promise<Product[]> {
    if (!userId) return [];

    const cached = getLocalProducts(userId);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getProducts warning:', error.message);
        return cached;
      }

      const list = (data as Product[]) || [];
      setLocalProducts(userId, list);
      return list;
    } catch (err: any) {
      console.warn('salesService.getProducts network fallback to local cache:', err?.message || err);
      return cached;
    }
  },

  /**
   * Create a new product.
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    const localProduct: Product = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: input.user_id,
      name: input.name,
      description: input.description || null,
      unit: input.unit || 'កញ្ចប់',
      cost_price: input.cost_price || 0,
      selling_price: input.selling_price || 0,
      current_stock: input.current_stock || 0,
      created_at: new Date().toISOString(),
    };

    const current = getLocalProducts(input.user_id);
    setLocalProducts(input.user_id, [localProduct, ...current]);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: input.user_id,
          name: input.name,
          description: input.description || null,
          unit: input.unit || 'កញ្ចប់',
          cost_price: input.cost_price || 0,
          selling_price: input.selling_price || 0,
          current_stock: input.current_stock || 0,
        })
        .select('*')
        .single();

      if (!error && data) {
        return data as Product;
      }
    } catch (err: any) {
      console.warn('salesService.createProduct network warning:', err?.message || err);
    }

    return localProduct;
  },

  /**
   * Update an existing product.
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.unit !== undefined) updatePayload.unit = input.unit;
    if (input.cost_price !== undefined) updatePayload.cost_price = input.cost_price;
    if (input.selling_price !== undefined) updatePayload.selling_price = input.selling_price;
    if (input.current_stock !== undefined) updatePayload.current_stock = input.current_stock;

    let targetUserId = '';
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PRODUCT_STORAGE_PREFIX)) {
        try {
          const list: Product[] = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = list.findIndex((p) => p.id === id);
          if (idx !== -1) {
            targetUserId = list[idx].user_id;
            list[idx] = { ...list[idx], ...input, updated_at: updatePayload.updated_at };
            localStorage.setItem(key, JSON.stringify(list));
            break;
          }
        } catch {}
      }
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        return data as Product;
      }
    } catch (err: any) {
      console.warn('salesService.updateProduct network warning:', err?.message || err);
    }

    return {
      id,
      user_id: targetUserId,
      name: input.name || '',
      description: input.description || null,
      unit: input.unit || 'កញ្ចប់',
      cost_price: input.cost_price || 0,
      selling_price: input.selling_price || 0,
      current_stock: input.current_stock || 0,
    } as Product;
  },

  /**
   * Delete a product by ID.
   */
  async deleteProduct(id: string): Promise<boolean> {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PRODUCT_STORAGE_PREFIX)) {
        try {
          const list: Product[] = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter((p) => p.id !== id);
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {}
      }
    }

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', id);
    } catch (err: any) {
      console.warn('salesService.deleteProduct network warning:', err?.message || err);
    }

    return true;
  },
};

