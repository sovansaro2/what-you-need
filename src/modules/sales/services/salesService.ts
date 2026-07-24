import { supabase } from '@/lib/supabase';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

export const salesService = {
  /**
   * Fetch all products for a specific user ID, ordered by name or created_at desc.
   */
  async getProducts(userId: string): Promise<Product[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error.message);
        throw new Error(error.message);
      }

      return (data as Product[]) || [];
    } catch (err: any) {
      console.error('salesService.getProducts error:', err);
      throw err;
    }
  },

  /**
   * Create a new product.
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
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

      if (error) {
        console.error('Error creating product:', error.message);
        throw new Error(error.message);
      }

      return data as Product;
    } catch (err: any) {
      console.error('salesService.createProduct error:', err);
      throw err;
    }
  },

  /**
   * Update an existing product.
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) updatePayload.name = input.name;
      if (input.description !== undefined) updatePayload.description = input.description;
      if (input.unit !== undefined) updatePayload.unit = input.unit;
      if (input.cost_price !== undefined) updatePayload.cost_price = input.cost_price;
      if (input.selling_price !== undefined) updatePayload.selling_price = input.selling_price;
      if (input.current_stock !== undefined) updatePayload.current_stock = input.current_stock;

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating product:', error.message);
        throw new Error(error.message);
      }

      return data as Product;
    } catch (err: any) {
      console.error('salesService.updateProduct error:', err);
      throw err;
    }
  },

  /**
   * Delete a product by ID.
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error.message);
        throw new Error(error.message);
      }

      return true;
    } catch (err: any) {
      console.error('salesService.deleteProduct error:', err);
      throw err;
    }
  },
};
