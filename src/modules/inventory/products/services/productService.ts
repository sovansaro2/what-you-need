import { supabase } from '@/lib/supabase';
import {
  InventoryProduct,
  CreateInventoryProductInput,
  UpdateInventoryProductInput,
  ProductFilter,
} from '../types';
import { KHMER_PRODUCT_MESSAGES, DEFAULT_MIN_STOCK_ALERT } from '../constants';
import { productValidator } from '../validators/productValidator';

const getLocalStorageKey = (userId: string) => `wyn_products_${userId}`;

const getLocalProducts = (userId: string): InventoryProduct[] => {
  try {
    const data = localStorage.getItem(getLocalStorageKey(userId));
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local products', e);
  }
  return [];
};

const setLocalProducts = (userId: string, products: InventoryProduct[]): void => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save local products', e);
  }
};

export const productService = {
  /**
   * Check if a SKU is already used by another product for this user.
   */
  async isSkuDuplicate(userId: string, sku: string, excludeProductId?: string): Promise<boolean> {
    if (!sku || !sku.trim()) return false;
    const cleanSku = sku.trim().toLowerCase();

    // Check local cache
    const local = getLocalProducts(userId);
    const hasLocalDup = local.some(
      (p) => p.id !== excludeProductId && p.sku && p.sku.trim().toLowerCase() === cleanSku
    );
    if (hasLocalDup) return true;

    // Check Supabase
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('user_id', userId)
        .ilike('sku', cleanSku);

      if (excludeProductId) {
        query = query.neq('id', excludeProductId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return true;
      }
    } catch (err) {
      console.warn('isSkuDuplicate network error fallback:', err);
    }

    return false;
  },

  /**
   * Fetch all products for a user with optional local/remote fallback.
   */
  async getProducts(userId: string, filter?: ProductFilter): Promise<InventoryProduct[]> {
    let products = getLocalProducts(userId);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteProducts: InventoryProduct[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          name: item.name,
          unit: item.unit || 'កញ្ចប់',
          unit_id: item.unit_id || null,
          category: item.category || 'ទូទៅ',
          category_id: item.category_id || null,
          cost_price: Number(item.cost_price) || 0,
          selling_price: Number(item.selling_price) || 0,
          current_stock: Number(item.current_stock) || 0,
          sku: item.sku || null,
          barcode: item.barcode || null,
          description: item.description || null,
          image_url: item.image_url || null,
          min_stock_alert: item.min_stock_alert !== undefined && item.min_stock_alert !== null ? Number(item.min_stock_alert) : DEFAULT_MIN_STOCK_ALERT,
          is_archived: Boolean(item.is_archived),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        // Merge remote and local
        const mergedMap = new Map<string, InventoryProduct>();
        products.forEach((p) => mergedMap.set(p.id, p));
        remoteProducts.forEach((p) => mergedMap.set(p.id, p));

        const mergedList = Array.from(mergedMap.values());
        setLocalProducts(userId, mergedList);
        products = mergedList;
      }
    } catch (err) {
      console.warn('productService.getProducts network warning:', err);
    }

    // Apply filtering logic
    let result = [...products];

    if (filter?.status) {
      if (filter.status === 'in_stock') {
        result = result.filter((p) => !p.is_archived && p.current_stock > (p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT));
      } else if (filter.status === 'low_stock') {
        result = result.filter(
          (p) =>
            !p.is_archived &&
            p.current_stock > 0 &&
            p.current_stock <= (p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT)
        );
      } else if (filter.status === 'out_of_stock') {
        result = result.filter((p) => !p.is_archived && p.current_stock <= 0);
      } else if (filter.status === 'archived') {
        result = result.filter((p) => p.is_archived);
      } else if (filter.status === 'all') {
        result = result.filter((p) => !p.is_archived);
      }
    } else {
      result = result.filter((p) => !p.is_archived);
    }

    if (filter?.category) {
      const cat = filter.category.trim().toLowerCase();
      result = result.filter(
        (p) => p.category.trim().toLowerCase() === cat || p.category_id === filter.category
      );
    }

    if (filter?.unit) {
      const u = filter.unit.trim().toLowerCase();
      result = result.filter(
        (p) => p.unit.trim().toLowerCase() === u || p.unit_id === filter.unit
      );
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortBy = filter?.sortBy || 'created_at';
    const sortOrder = filter?.sortOrder || 'desc';

    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof InventoryProduct];
      let valB: any = b[sortBy as keyof InventoryProduct];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB, 'km') : valB.localeCompare(valA, 'km');
      }

      valA = valA || 0;
      valB = valB || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  },

  /**
   * Get product by ID.
   */
  async getProductById(userId: string, id: string): Promise<InventoryProduct | null> {
    const products = await this.getProducts(userId, { status: 'all' });
    const found = products.find((p) => p.id === id);
    return found || null;
  },

  /**
   * Create a new product.
   */
  async createProduct(
    userId: string,
    input: CreateInventoryProductInput
  ): Promise<InventoryProduct> {
    // 1. Validate inputs
    const errors = productValidator.validateCreate(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    // 2. Check SKU uniqueness if provided
    if (input.sku && input.sku.trim()) {
      const isDup = await this.isSkuDuplicate(userId, input.sku);
      if (isDup) {
        throw new Error(KHMER_PRODUCT_MESSAGES.SKU_DUPLICATE);
      }
    }

    const now = new Date().toISOString();
    const newProduct: InventoryProduct = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: input.name.trim(),
      unit: input.unit.trim(),
      unit_id: input.unit_id || null,
      category: input.category.trim(),
      category_id: input.category_id || null,
      cost_price: Number(input.cost_price),
      selling_price: Number(input.selling_price),
      current_stock: input.initial_stock !== undefined ? Number(input.initial_stock) : 0,
      sku: input.sku?.trim() || null,
      barcode: input.barcode?.trim() || null,
      description: input.description?.trim() || null,
      image_url: input.image_url?.trim() || null,
      min_stock_alert:
        input.min_stock_alert !== undefined && input.min_stock_alert !== null
          ? Number(input.min_stock_alert)
          : DEFAULT_MIN_STOCK_ALERT,
      is_archived: false,
      created_at: now,
      updated_at: now,
    };

    // Save local
    const local = getLocalProducts(userId);
    local.unshift(newProduct);
    setLocalProducts(userId, local);

    // Save Supabase
    try {
      const payload = {
        user_id: userId,
        name: newProduct.name,
        unit: newProduct.unit,
        unit_id: newProduct.unit_id,
        category: newProduct.category,
        category_id: newProduct.category_id,
        cost_price: newProduct.cost_price,
        selling_price: newProduct.selling_price,
        current_stock: newProduct.current_stock,
        sku: newProduct.sku,
        barcode: newProduct.barcode,
        description: newProduct.description,
        image_url: newProduct.image_url,
        min_stock_alert: newProduct.min_stock_alert,
        is_archived: false,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select().single();
      if (!error && data) {
        newProduct.id = data.id;
        const updatedLocal = local.map((p) => (p.name === newProduct.name ? { ...p, id: data.id } : p));
        setLocalProducts(userId, updatedLocal);
      }
    } catch (e) {
      console.warn('Supabase create product offline fallback:', e);
    }

    return newProduct;
  },

  /**
   * Update existing product.
   * Note: current_stock is STRICTLY read-only here. Stock changes are prohibited in product editing.
   */
  async updateProduct(
    userId: string,
    id: string,
    input: UpdateInventoryProductInput
  ): Promise<InventoryProduct> {
    // 1. Validate inputs
    const errors = productValidator.validateUpdate(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    // 2. Check SKU duplicate if SKU is updated
    if (input.sku && input.sku.trim()) {
      const isDup = await this.isSkuDuplicate(userId, input.sku, id);
      if (isDup) {
        throw new Error(KHMER_PRODUCT_MESSAGES.SKU_DUPLICATE);
      }
    }

    const local = getLocalProducts(userId);
    const index = local.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(KHMER_PRODUCT_MESSAGES.NOT_FOUND);
    }

    const target = local[index];

    if (input.name !== undefined) target.name = input.name.trim();
    if (input.unit !== undefined) target.unit = input.unit.trim();
    if (input.unit_id !== undefined) target.unit_id = input.unit_id;
    if (input.category !== undefined) target.category = input.category.trim();
    if (input.category_id !== undefined) target.category_id = input.category_id;
    if (input.cost_price !== undefined) target.cost_price = Number(input.cost_price);
    if (input.selling_price !== undefined) target.selling_price = Number(input.selling_price);
    if (input.sku !== undefined) target.sku = input.sku.trim() || null;
    if (input.barcode !== undefined) target.barcode = input.barcode.trim() || null;
    if (input.description !== undefined) target.description = input.description.trim() || null;
    if (input.image_url !== undefined) target.image_url = input.image_url.trim() || null;
    if (input.min_stock_alert !== undefined) target.min_stock_alert = Number(input.min_stock_alert);
    if (input.is_archived !== undefined) target.is_archived = input.is_archived;

    target.updated_at = new Date().toISOString();
    local[index] = target;
    setLocalProducts(userId, local);

    // Sync remote
    try {
      await supabase
        .from('products')
        .update({
          name: target.name,
          unit: target.unit,
          unit_id: target.unit_id,
          category: target.category,
          category_id: target.category_id,
          cost_price: target.cost_price,
          selling_price: target.selling_price,
          sku: target.sku,
          barcode: target.barcode,
          description: target.description,
          image_url: target.image_url,
          min_stock_alert: target.min_stock_alert,
          is_archived: target.is_archived,
          updated_at: target.updated_at,
        })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase update product fallback:', e);
    }

    return target;
  },

  /**
   * Archive a product.
   */
  async archiveProduct(userId: string, id: string): Promise<InventoryProduct> {
    return this.updateProduct(userId, id, { is_archived: true });
  },

  /**
   * Unarchive a product.
   */
  async unarchiveProduct(userId: string, id: string): Promise<InventoryProduct> {
    return this.updateProduct(userId, id, { is_archived: false });
  },
};
