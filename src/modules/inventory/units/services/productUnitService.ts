import { supabase } from '@/lib/supabase';
import { ProductUnit, CreateProductUnitInput, UpdateProductUnitInput, ProductUnitFilter } from '../types';
import { DEFAULT_KHMER_UNITS, KHMER_MESSAGES } from '../constants';
import {
  businessContext,
  handleInventoryError,
  queryHelpers,
  inventoryMapper,
  inventoryValidator,
} from '../../foundation';

export const productUnitService = {
  /**
   * Seed default units into live Supabase product_units table if empty.
   */
  async ensureDefaultUnits(userId: string): Promise<ProductUnit[]> {
    try {
      // 1. Fetch existing units from Supabase
      const { data: existing, error } = await supabase
        .from('product_units')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && existing && existing.length > 0) {
        return existing.map((unit: any) => inventoryMapper.mapDbRecordToUnit(unit, userId));
      }

      // 2. If table is empty and no error, insert default units
      if (!error) {
        const payloads = DEFAULT_KHMER_UNITS.map((u) => ({
          name: u.name.trim(),
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('product_units')
          .insert(payloads)
          .select('*');

        if (!insertError && inserted && inserted.length > 0) {
          return inserted.map((unit: any) => inventoryMapper.mapDbRecordToUnit(unit, userId));
        }
      }

      return DEFAULT_KHMER_UNITS.map((u, index) => ({
        id: `unit_default_${index + 1}`,
        business_id: userId,
        user_id: userId,
        name: u.name,
        symbol: u.symbol || null,
        is_default: false,
        is_active: true,
        is_archived: false,
        product_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[ProductUnitService.ensureDefaultUnits] Falling back to default units:', err);
      return DEFAULT_KHMER_UNITS.map((u, index) => ({
        id: `unit_default_${index + 1}`,
        business_id: userId,
        user_id: userId,
        name: u.name,
        symbol: u.symbol || null,
        is_default: false,
        is_active: true,
        is_archived: false,
        product_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  },

  /**
   * Calculate product counts per unit ID from Supabase products table.
   */
  async getUnitProductCounts(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    try {
      let query = supabase.from('products').select('id, unit_id');
      query = queryHelpers.notDeleted(query);

      if (businessContext.validateBusinessId(userId)) {
        query = queryHelpers.byBusiness(query, userId);
      }

      const { data, error } = await query;

      if (!error && data) {
        data.forEach((p: any) => {
          if (p.unit_id) {
            counts[p.unit_id] = (counts[p.unit_id] || 0) + 1;
          }
        });
      }
    } catch (err) {
      console.warn('[ProductUnitService] Error getting unit product counts:', err);
    }

    return counts;
  },

  /**
   * Fetch units directly from live Supabase DB with product counts attached.
   */
  async getUnits(userId: string, _filter: ProductUnitFilter = 'active'): Promise<ProductUnit[]> {
    try {
      const units = await this.ensureDefaultUnits(userId);
      const productCounts = await this.getUnitProductCounts(userId);

      return units.map((u) => ({
        ...u,
        product_count: productCounts[u.id] || 0,
      }));
    } catch (err: any) {
      handleInventoryError(err, 'ProductUnitService.getUnits');
    }
  },

  /**
   * Check if unit name exists in live Supabase DB (case-insensitive & trimmed).
   */
  async checkNameExists(userId: string, name: string, excludeId?: string): Promise<boolean> {
    if (!name || !name.trim()) return false;
    const cleanName = name.trim();

    try {
      let query = supabase
        .from('product_units')
        .select('id')
        .ilike('name', cleanName);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return Boolean(data && data.length > 0);
    } catch (err: any) {
      handleInventoryError(err, 'ProductUnitService.checkNameExists');
    }
  },

  /**
   * Create a new unit in live Supabase DB.
   */
  async createUnit(userId: string, input: CreateProductUnitInput): Promise<ProductUnit> {
    const nameErrors = inventoryValidator.validateUnitName(input.name);
    if (nameErrors.length > 0) {
      throw new Error(KHMER_MESSAGES.NAME_REQUIRED);
    }

    const trimmedName = input.name.trim();

    const isDuplicate = await this.checkNameExists(userId, trimmedName);
    if (isDuplicate) {
      throw new Error(KHMER_MESSAGES.NAME_DUPLICATE);
    }

    try {
      const payload = inventoryMapper.mapUnitInputToDbPayload(trimmedName);

      const { data, error } = await supabase
        .from('product_units')
        .insert([payload])
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create unit');
      }

      return inventoryMapper.mapDbRecordToUnit(data, userId);
    } catch (err: any) {
      handleInventoryError(err, 'ProductUnitService.createUnit');
    }
  },

  /**
   * Update an existing product unit in live Supabase DB.
   */
  async updateUnit(id: string, userId: string, input: UpdateProductUnitInput): Promise<ProductUnit> {
    try {
      const payload: Record<string, any> = {};

      if (input.name !== undefined) {
        const nameErrors = inventoryValidator.validateUnitName(input.name);
        if (nameErrors.length > 0) {
          throw new Error(KHMER_MESSAGES.NAME_REQUIRED);
        }
        const trimmedName = input.name.trim();
        const isDuplicate = await this.checkNameExists(userId, trimmedName, id);
        if (isDuplicate) {
          throw new Error(KHMER_MESSAGES.NAME_DUPLICATE);
        }
        payload.name = trimmedName;
      }

      if (Object.keys(payload).length === 0) {
        const { data, error } = await supabase
          .from('product_units')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) throw error || new Error('Unit not found');
        return inventoryMapper.mapDbRecordToUnit(data, userId);
      }

      const { data, error } = await supabase
        .from('product_units')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to update unit');
      }

      return inventoryMapper.mapDbRecordToUnit(data, userId);
    } catch (err: any) {
      handleInventoryError(err, 'ProductUnitService.updateUnit');
    }
  },

  /**
   * Check if unit is referenced by any product in Supabase products table.
   */
  async checkUnitInUse(id: string, userId: string): Promise<number> {
    try {
      let query = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('unit_id', id);

      query = queryHelpers.notDeleted(query);

      if (businessContext.validateBusinessId(userId)) {
        query = queryHelpers.byBusiness(query, userId);
      }

      const { count, error } = await query;

      if (!error && typeof count === 'number') {
        return count;
      }
    } catch (err) {
      console.warn('[ProductUnitService] Error checking unit in use:', err);
    }

    return 0;
  },

  /**
   * Delete unit permanently from live Supabase DB.
   */
  async deleteUnit(id: string, userId: string): Promise<boolean> {
    try {
      const inUseCount = await this.checkUnitInUse(id, userId);
      if (inUseCount > 0) {
        throw new Error(KHMER_MESSAGES.UNIT_IN_USE);
      }

      const { error } = await supabase.from('product_units').delete().eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      handleInventoryError(err, 'ProductUnitService.deleteUnit');
    }
  },

  /**
   * Archive unit.
   */
  async archiveUnit(id: string, userId: string): Promise<ProductUnit> {
    const inUseCount = await this.checkUnitInUse(id, userId);
    if (inUseCount > 0) {
      throw new Error(KHMER_MESSAGES.UNIT_IN_USE);
    }
    return this.updateUnit(id, userId, { is_archived: true });
  },

  /**
   * Unarchive unit.
   */
  async unarchiveUnit(id: string, userId: string): Promise<ProductUnit> {
    return this.updateUnit(id, userId, { is_archived: false });
  },
};
