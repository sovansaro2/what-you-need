import { supabase } from '@/lib/supabase';
import {
  InventoryProduct,
  CreateInventoryProductInput,
  UpdateInventoryProductInput,
  ProductFilter,
} from '../types';
import { KHMER_PRODUCT_MESSAGES, DEFAULT_MIN_STOCK_ALERT } from '../constants';
import { productValidator } from '../validators/productValidator';
import { notifyInventoryUpdated } from '../../events/inventoryEvents';
import {
  businessContext,
  handleInventoryError,
  queryHelpers,
  inventoryMapper,
} from '../../foundation';

export const productService = {
  /**
   * Check if a SKU is already used by another product for this business.
   */
  async isSkuDuplicate(businessId: string, sku: string, excludeProductId?: string): Promise<boolean> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);
    if (!sku || !sku.trim()) return false;
    const cleanSku = sku.trim();

    try {
      let query = supabase
        .from('products')
        .select('id')
        .ilike('sku', cleanSku);

      query = queryHelpers.byBusiness(query, validBusinessId);

      if (excludeProductId) {
        query = query.neq('id', excludeProductId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return Boolean(data && data.length > 0);
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.isSkuDuplicate');
    }
  },

  /**
   * Fetch all products for a business directly from live Supabase DB.
   */
  async getProducts(businessId: string, filter?: ProductFilter): Promise<InventoryProduct[]> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      let query = supabase
        .from('products')
        .select('*, category:product_categories(id, name), unit:product_units(id, name)')
        .order('created_at', { ascending: false });

      query = queryHelpers.byBusiness(query, validBusinessId);
      query = queryHelpers.notDeleted(query);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const remoteProducts: InventoryProduct[] = (data || []).map((item: any) =>
        inventoryMapper.mapDbRecordToProduct(item)
      );

      // Apply filtering logic
      let result = [...remoteProducts];

      if (filter?.status) {
        if (filter.status === 'in_stock') {
          result = result.filter(
            (p) => !p.is_archived && p.current_stock > (p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT)
          );
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
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.getProducts');
    }
  },

  /**
   * Get product by ID directly from Supabase.
   */
  async getProductById(businessId: string, id: string): Promise<InventoryProduct | null> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      let query = supabase
        .from('products')
        .select('*, category:product_categories(id, name), unit:product_units(id, name)');

      query = queryHelpers.byBusiness(query, validBusinessId);
      query = queryHelpers.byId(query, id);
      query = queryHelpers.notDeleted(query);

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) return null;

      return inventoryMapper.mapDbRecordToProduct(data);
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.getProductById');
    }
  },

  /**
   * Create a new product in live Supabase database.
   */
  async createProduct(
    businessId: string,
    input: CreateInventoryProductInput
  ): Promise<InventoryProduct> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    // 1. Validate inputs
    const errors = productValidator.validateCreate(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    // 2. Check SKU uniqueness if provided
    if (input.sku && input.sku.trim()) {
      const isDup = await this.isSkuDuplicate(validBusinessId, input.sku);
      if (isDup) {
        throw new Error(KHMER_PRODUCT_MESSAGES.SKU_DUPLICATE);
      }
    }

    // 3. Prepare schema-compliant payload using mapper
    const payload = inventoryMapper.mapCreateProductInputToDbPayload(validBusinessId, input);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select('*, category:product_categories(id, name), unit:product_units(id, name)')
        .single();

      if (error || !data) {
        throw error || new Error('Unknown database error');
      }

      const createdProduct = inventoryMapper.mapDbRecordToProduct(data);
      notifyInventoryUpdated({ productId: createdProduct.id, source: 'product_create' });
      return createdProduct;
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.createProduct');
    }
  },

  /**
   * Update existing product in live Supabase database.
   */
  async updateProduct(
    businessId: string,
    id: string,
    input: UpdateInventoryProductInput
  ): Promise<InventoryProduct> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    // 1. Validate inputs
    const errors = productValidator.validateUpdate(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    // 2. Check SKU duplicate if SKU is updated
    if (input.sku && input.sku.trim()) {
      const isDup = await this.isSkuDuplicate(validBusinessId, input.sku, id);
      if (isDup) {
        throw new Error(KHMER_PRODUCT_MESSAGES.SKU_DUPLICATE);
      }
    }

    // 3. Prepare schema-compliant update payload using mapper
    const payload = inventoryMapper.mapUpdateProductInputToDbPayload(input);

    try {
      let query = supabase.from('products').update(payload);
      query = queryHelpers.byBusiness(query, validBusinessId);
      query = queryHelpers.byId(query, id);

      const { data, error } = await query
        .select('*, category:product_categories(id, name), unit:product_units(id, name)')
        .single();

      if (error || !data) {
        throw error || new Error('Product not found');
      }

      const updatedProduct = inventoryMapper.mapDbRecordToProduct(data);
      notifyInventoryUpdated({ productId: updatedProduct.id, source: 'product_update' });
      return updatedProduct;
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.updateProduct');
    }
  },

  /**
   * Delete a product permanently from live Supabase database.
   */
  async deleteProduct(businessId: string, id: string): Promise<boolean> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      let query = supabase.from('products').delete();
      query = queryHelpers.byBusiness(query, validBusinessId);
      query = queryHelpers.byId(query, id);

      const { error } = await query;

      if (error) {
        throw error;
      }

      notifyInventoryUpdated({ productId: id, source: 'product_delete' });
      return true;
    } catch (err: any) {
      handleInventoryError(err, 'ProductService.deleteProduct');
    }
  },

  /**
   * Archive a product.
   */
  async archiveProduct(businessId: string, id: string): Promise<InventoryProduct> {
    return this.updateProduct(businessId, id, { is_archived: true });
  },

  /**
   * Unarchive a product.
   */
  async unarchiveProduct(businessId: string, id: string): Promise<InventoryProduct> {
    return this.updateProduct(businessId, id, { is_archived: false });
  },
};
