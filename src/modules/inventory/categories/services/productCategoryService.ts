import { supabase } from '@/lib/supabase';
import {
  ProductCategory,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  ProductCategoryFilter,
} from '../types';
import { DEFAULT_KHMER_CATEGORIES, KHMER_CATEGORY_MESSAGES } from '../constants';
import {
  businessContext,
  handleInventoryError,
  queryHelpers,
  inventoryMapper,
  inventoryValidator,
} from '../../foundation';

export const productCategoryService = {
  /**
   * Seed default categories into live Supabase product_categories or categories table if empty.
   */
  async ensureDefaultCategories(userId: string): Promise<ProductCategory[]> {
    try {
      let data: any[] | null = null;
      let error: any = null;
      let tableName = 'product_categories';

      // 1. Fetch existing categories from Supabase (try product_categories, fallback to categories)
      const res = await supabase
        .from('product_categories')
        .select('*')
        .order('created_at', { ascending: true });

      data = res.data;
      error = res.error;

      if (error && (error.code === 'PGRST205' || error.message?.includes('product_categories'))) {
        tableName = 'categories';
        const fallbackRes = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data && data.length > 0) {
        return data.map((cat: any) => inventoryMapper.mapDbRecordToCategory(cat, userId));
      }

      // 2. If table is empty and no database error, try inserting default categories
      if (!error) {
        const payloads = DEFAULT_KHMER_CATEGORIES.map((c) => ({
          name: c.name.trim(),
        }));

        const { data: inserted, error: insertError } = await supabase
          .from(tableName)
          .insert(payloads)
          .select('*');

        if (!insertError && inserted && inserted.length > 0) {
          return inserted.map((cat: any) => inventoryMapper.mapDbRecordToCategory(cat, userId));
        }
      }

      // 3. Graceful fallback to default mapped Khmer categories
      return DEFAULT_KHMER_CATEGORIES.map((c, index) => ({
        id: `cat_default_${index + 1}`,
        business_id: userId,
        user_id: userId,
        name: c.name,
        description: c.description || null,
        is_default: true,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[ProductCategoryService.ensureDefaultCategories] Database error, returning fallback categories:', err);
      return DEFAULT_KHMER_CATEGORIES.map((c, index) => ({
        id: `cat_default_${index + 1}`,
        business_id: userId,
        user_id: userId,
        name: c.name,
        description: c.description || null,
        is_default: true,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  },

  /**
   * Calculate product counts per category ID from Supabase products table.
   */
  async getCategoryProductCounts(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    try {
      let query = supabase.from('products').select('id, category_id');
      query = queryHelpers.notDeleted(query);

      if (businessContext.validateBusinessId(userId)) {
        query = queryHelpers.byBusiness(query, userId);
      }

      const { data, error } = await query;

      if (!error && data) {
        data.forEach((p: any) => {
          if (p.category_id) {
            counts[p.category_id] = (counts[p.category_id] || 0) + 1;
          }
        });
      }
    } catch (err) {
      console.warn('[ProductCategoryService] Error getting category product counts:', err);
    }

    return counts;
  },

  /**
   * Fetch all categories directly from live Supabase DB with product counts attached.
   */
  async getCategories(
    userId: string,
    _filter: ProductCategoryFilter = 'active'
  ): Promise<ProductCategory[]> {
    try {
      const categories = await this.ensureDefaultCategories(userId);
      const productCounts = await this.getCategoryProductCounts(userId);

      return categories.map((c) => ({
        ...c,
        product_count: productCounts[c.id] || 0,
      }));
    } catch (err: any) {
      console.warn('[ProductCategoryService.getCategories] Error fetching categories, returning defaults:', err);
      return DEFAULT_KHMER_CATEGORIES.map((c, index) => ({
        id: `cat_default_${index + 1}`,
        business_id: userId,
        user_id: userId,
        name: c.name,
        description: c.description || null,
        is_default: true,
        is_archived: false,
        product_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  },

  /**
   * Check if category name already exists (case-insensitive & trimmed) in DB.
   */
  async isNameDuplicate(userId: string, name: string, excludeId?: string): Promise<boolean> {
    if (!name || !name.trim()) return false;
    const cleanName = name.trim();

    try {
      let query = supabase
        .from('product_categories')
        .select('id')
        .ilike('name', cleanName);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error && (error.code === 'PGRST205' || error.message?.includes('product_categories'))) {
        let fallbackQuery = supabase.from('categories').select('id').ilike('name', cleanName);
        if (excludeId) fallbackQuery = fallbackQuery.neq('id', excludeId);
        const res = await fallbackQuery;
        return Boolean(res.data && res.data.length > 0);
      }

      return Boolean(data && data.length > 0);
    } catch (err: any) {
      console.warn('[ProductCategoryService.isNameDuplicate] Warning checking duplicate name:', err);
      return false;
    }
  },

  /**
   * Create a new custom category in live Supabase DB.
   */
  async createCategory(
    userId: string,
    input: CreateProductCategoryInput
  ): Promise<ProductCategory> {
    const nameErrors = inventoryValidator.validateCategoryName(input.name);
    if (nameErrors.length > 0) {
      throw new Error(KHMER_CATEGORY_MESSAGES.NAME_REQUIRED);
    }

    const trimmedName = input.name.trim();

    const isDup = await this.isNameDuplicate(userId, trimmedName);
    if (isDup) {
      throw new Error(KHMER_CATEGORY_MESSAGES.NAME_DUPLICATE);
    }

    try {
      const payload = inventoryMapper.mapCategoryInputToDbPayload(trimmedName);

      const { data, error } = await supabase
        .from('product_categories')
        .insert([payload])
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create category');
      }

      return inventoryMapper.mapDbRecordToCategory(data, userId);
    } catch (err: any) {
      handleInventoryError(err, 'ProductCategoryService.createCategory');
    }
  },

  /**
   * Update existing category in live Supabase DB.
   */
  async updateCategory(
    userId: string,
    id: string,
    input: UpdateProductCategoryInput
  ): Promise<ProductCategory> {
    try {
      const payload: Record<string, any> = {};

      if (input.name !== undefined) {
        const nameErrors = inventoryValidator.validateCategoryName(input.name);
        if (nameErrors.length > 0) {
          throw new Error(KHMER_CATEGORY_MESSAGES.NAME_REQUIRED);
        }
        const trimmedName = input.name.trim();
        const isDup = await this.isNameDuplicate(userId, trimmedName, id);
        if (isDup) {
          throw new Error(KHMER_CATEGORY_MESSAGES.NAME_DUPLICATE);
        }
        payload.name = trimmedName;
      }

      if (Object.keys(payload).length === 0) {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) throw error || new Error('Category not found');
        return inventoryMapper.mapDbRecordToCategory(data, userId);
      }

      const { data, error } = await supabase
        .from('product_categories')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to update category');
      }

      return inventoryMapper.mapDbRecordToCategory(data, userId);
    } catch (err: any) {
      handleInventoryError(err, 'ProductCategoryService.updateCategory');
    }
  },

  /**
   * Delete category permanently from live Supabase DB.
   */
  async deleteCategory(userId: string, id: string): Promise<boolean> {
    try {
      const counts = await this.getCategoryProductCounts(userId);
      if ((counts[id] || 0) > 0) {
        throw new Error(KHMER_CATEGORY_MESSAGES.CANNOT_ARCHIVE_IN_USE);
      }

      const { error } = await supabase.from('product_categories').delete().eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      handleInventoryError(err, 'ProductCategoryService.deleteCategory');
    }
  },

  /**
   * Archive category.
   */
  async archiveCategory(userId: string, id: string): Promise<ProductCategory> {
    return this.updateCategory(userId, id, { is_archived: true });
  },

  /**
   * Unarchive category.
   */
  async unarchiveCategory(userId: string, id: string): Promise<ProductCategory> {
    return this.updateCategory(userId, id, { is_archived: false });
  },
};
