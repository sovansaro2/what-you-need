import { supabase } from '@/lib/supabase';
import { ProductCategory, CreateProductCategoryInput, UpdateProductCategoryInput, ProductCategoryFilter } from '../types';
import { DEFAULT_KHMER_CATEGORIES, KHMER_CATEGORY_MESSAGES } from '../constants';

const getLocalStorageKey = (userId: string) => `wyn_product_categories_${userId}`;

const getLocalCategories = (userId: string): ProductCategory[] => {
  try {
    const data = localStorage.getItem(getLocalStorageKey(userId));
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local product categories', e);
  }
  return [];
};

const setLocalCategories = (userId: string, categories: ProductCategory[]): void => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save local product categories', e);
  }
};

export const productCategoryService = {
  /**
   * Seed default categories for a new user if none exist.
   */
  async ensureDefaultCategories(userId: string): Promise<ProductCategory[]> {
    let existing = getLocalCategories(userId);

    if (existing.length === 0) {
      const now = new Date().toISOString();
      const initialCategories: ProductCategory[] = DEFAULT_KHMER_CATEGORIES.map((cat, idx) => ({
        id: `default-cat-${idx + 1}-${Date.now()}`,
        user_id: userId,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        is_default: cat.is_default,
        is_archived: false,
        created_at: now,
        updated_at: now,
      }));

      setLocalCategories(userId, initialCategories);
      existing = initialCategories;

      // Try inserting into Supabase
      try {
        const payload = initialCategories.map((c) => ({
          user_id: c.user_id,
          name: c.name,
          description: c.description,
          color: c.color,
          is_default: c.is_default,
          is_archived: false,
        }));
        await supabase.from('product_categories').insert(payload);
      } catch (e) {
        console.warn('Supabase product_categories seed fallback:', e);
      }
    }

    return existing;
  },

  /**
   * Calculate product counts per category ID or name.
   */
  async getCategoryProductCounts(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, category, category_id')
        .eq('user_id', userId);

      if (!error && data) {
        data.forEach((p: any) => {
          if (p.category_id) {
            counts[p.category_id] = (counts[p.category_id] || 0) + 1;
          }
          if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        });
      }
    } catch {}

    try {
      const rawProducts = localStorage.getItem(`wyn_products_${userId}`);
      if (rawProducts) {
        const list = JSON.parse(rawProducts);
        if (Array.isArray(list)) {
          list.forEach((p: any) => {
            if (p.category_id) {
              counts[p.category_id] = (counts[p.category_id] || 0) + 1;
            }
            if (p.category) {
              counts[p.category] = (counts[p.category] || 0) + 1;
            }
          });
        }
      }
    } catch {}

    return counts;
  },

  /**
   * Fetch categories with filtering and product counts.
   */
  async getCategories(userId: string, filter: ProductCategoryFilter = 'active'): Promise<ProductCategory[]> {
    let categories = getLocalCategories(userId);
    if (categories.length === 0) {
      categories = await this.ensureDefaultCategories(userId);
    }

    const productCounts = await this.getCategoryProductCounts(userId);

    try {
      let query = supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', userId);

      if (filter === 'active') {
        query = query.eq('is_archived', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const remoteList: ProductCategory[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          name: item.name,
          description: item.description || '',
          color: item.color || '#6366f1',
          is_default: Boolean(item.is_default),
          is_archived: Boolean(item.is_archived),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        const mergedMap = new Map<string, ProductCategory>();
        categories.forEach((c) => mergedMap.set(c.id, c));
        remoteList.forEach((c) => mergedMap.set(c.id, c));

        setLocalCategories(userId, Array.from(mergedMap.values()));
        categories = remoteList;
      }
    } catch (err: any) {
      console.warn('productCategoryService.getCategories network warning:', err?.message || err);
    }

    if (filter === 'active') {
      categories = categories.filter((c) => !c.is_archived);
    } else if (filter === 'archived') {
      categories = categories.filter((c) => c.is_archived);
    }

    return categories.map((c) => {
      const count = (productCounts[c.id] || 0) + (productCounts[c.name] || 0);
      return {
        ...c,
        product_count: count,
      };
    });
  },

  /**
   * Check if category name already exists (case-insensitive & trimmed)
   */
  async isNameDuplicate(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    const categories = await this.getCategories(userId, 'all');

    return categories.some(
      (c) => c.id !== excludeId && c.name.trim().toLowerCase() === trimmed
    );
  },

  /**
   * Create a new custom category.
   */
  async createCategory(userId: string, input: CreateProductCategoryInput): Promise<ProductCategory> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error(KHMER_CATEGORY_MESSAGES.NAME_REQUIRED);
    }

    const isDup = await this.isNameDuplicate(userId, trimmedName);
    if (isDup) {
      throw new Error(KHMER_CATEGORY_MESSAGES.NAME_DUPLICATE);
    }

    const now = new Date().toISOString();
    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: trimmedName,
      description: input.description?.trim() || '',
      color: input.color || '#6366f1',
      is_default: false,
      is_archived: false,
      created_at: now,
      updated_at: now,
    };

    // Save local
    const allLocal = getLocalCategories(userId);
    allLocal.unshift(newCategory);
    setLocalCategories(userId, allLocal);

    // Sync remote
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([
          {
            user_id: userId,
            name: newCategory.name,
            description: newCategory.description,
            color: newCategory.color,
            is_default: false,
            is_archived: false,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        newCategory.id = data.id;
        const updatedLocal = allLocal.map((c) => (c.name === newCategory.name ? { ...c, id: data.id } : c));
        setLocalCategories(userId, updatedLocal);
      }
    } catch (e) {
      console.warn('Supabase create category offline fallback:', e);
    }

    return newCategory;
  },

  /**
   * Update existing category.
   */
  async updateCategory(
    userId: string,
    id: string,
    input: UpdateProductCategoryInput
  ): Promise<ProductCategory> {
    const allLocal = getLocalCategories(userId);
    const targetIndex = allLocal.findIndex((c) => c.id === id);

    if (targetIndex === -1) {
      throw new Error('រកមិនឃើញប្រភេទទំនិញឡើយ');
    }

    const target = allLocal[targetIndex];

    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new Error(KHMER_CATEGORY_MESSAGES.NAME_REQUIRED);
      }
      const isDup = await this.isNameDuplicate(userId, trimmedName, id);
      if (isDup) {
        throw new Error(KHMER_CATEGORY_MESSAGES.NAME_DUPLICATE);
      }
      target.name = trimmedName;
    }

    if (input.description !== undefined) {
      target.description = input.description.trim();
    }

    if (input.color !== undefined) {
      target.color = input.color;
    }

    if (input.is_archived !== undefined) {
      if (target.is_default && input.is_archived) {
        throw new Error(KHMER_CATEGORY_MESSAGES.CANNOT_ARCHIVE_DEFAULT);
      }
      target.is_archived = input.is_archived;
    }

    target.updated_at = new Date().toISOString();
    allLocal[targetIndex] = target;
    setLocalCategories(userId, allLocal);

    try {
      await supabase
        .from('product_categories')
        .update({
          name: target.name,
          description: target.description,
          color: target.color,
          is_archived: target.is_archived,
        })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase update category fallback:', e);
    }

    return target;
  },

  /**
   * Archive a category
   */
  async archiveCategory(userId: string, id: string): Promise<ProductCategory> {
    const counts = await this.getCategoryProductCounts(userId);
    const categories = await this.getCategories(userId, 'all');
    const target = categories.find((c) => c.id === id);

    if (target && target.is_default) {
      throw new Error(KHMER_CATEGORY_MESSAGES.CANNOT_ARCHIVE_DEFAULT);
    }

    const inUse = target && ((counts[target.id] || 0) > 0 || (counts[target.name] || 0) > 0);
    if (inUse) {
      throw new Error(KHMER_CATEGORY_MESSAGES.CANNOT_ARCHIVE_IN_USE);
    }

    return this.updateCategory(userId, id, { is_archived: true });
  },

  /**
   * Unarchive a category
   */
  async unarchiveCategory(userId: string, id: string): Promise<ProductCategory> {
    return this.updateCategory(userId, id, { is_archived: false });
  },
};
