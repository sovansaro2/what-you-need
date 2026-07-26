import { supabase } from '@/lib/supabase';
import { ProductUnit, CreateProductUnitInput, UpdateProductUnitInput, ProductUnitFilter } from '../types';
import { DEFAULT_KHMER_UNITS, KHMER_MESSAGES } from '../constants';

const UNITS_STORAGE_PREFIX = 'wyn_product_units_';

const getLocalUnits = (userId: string): ProductUnit[] => {
  try {
    const raw = localStorage.getItem(`${UNITS_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalUnits = (userId: string, units: ProductUnit[]): void => {
  try {
    localStorage.setItem(`${UNITS_STORAGE_PREFIX}${userId}`, JSON.stringify(units));
  } catch (err) {
    console.warn('Failed to save product units to localStorage:', err);
  }
};

export const productUnitService = {
  /**
   * Ensures default Khmer units exist for the user.
   */
  async ensureDefaultUnits(userId: string): Promise<ProductUnit[]> {
    if (!userId) return [];

    let current = getLocalUnits(userId);

    if (current.length === 0) {
      const now = new Date().toISOString();
      current = DEFAULT_KHMER_UNITS.map((item, index) => ({
        id: `unit_default_${index + 1}_${Date.now()}`,
        user_id: userId,
        name: item.name,
        symbol: item.symbol,
        description: item.description,
        is_default: true,
        is_archived: false,
        created_at: now,
        updated_at: now,
      }));
      setLocalUnits(userId, current);
    }

    try {
      const { data: existing, error } = await supabase
        .from('product_units')
        .select('*')
        .eq('user_id', userId);

      if (!error && existing && existing.length > 0) {
        const remoteUnits = existing as ProductUnit[];
        setLocalUnits(userId, remoteUnits);
        return remoteUnits;
      }

      // If Supabase table exists and is empty, insert defaults
      const defaultsToInsert = DEFAULT_KHMER_UNITS.map((item) => ({
        user_id: userId,
        name: item.name,
        symbol: item.symbol,
        description: item.description,
        is_default: true,
        is_archived: false,
      }));

      const { data: inserted, error: insertErr } = await supabase
        .from('product_units')
        .upsert(defaultsToInsert, { onConflict: 'user_id, name', ignoreDuplicates: true })
        .select('*');

      if (!insertErr && inserted && inserted.length > 0) {
        const allUnits = inserted as ProductUnit[];
        setLocalUnits(userId, allUnits);
        return allUnits;
      }
    } catch (err: any) {
      console.warn('productUnitService.ensureDefaultUnits network warning:', err?.message || err);
    }

    return current;
  },

  /**
   * Calculate product count for each unit of the user.
   */
  async getUnitProductCounts(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, unit, unit_id')
        .eq('user_id', userId);

      if (!error && data) {
        data.forEach((p: any) => {
          if (p.unit_id) {
            counts[p.unit_id] = (counts[p.unit_id] || 0) + 1;
          }
          if (p.unit) {
            counts[p.unit] = (counts[p.unit] || 0) + 1;
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
            if (p.unit_id) {
              counts[p.unit_id] = (counts[p.unit_id] || 0) + 1;
            }
            if (p.unit) {
              counts[p.unit] = (counts[p.unit] || 0) + 1;
            }
          });
        }
      }
    } catch {}

    return counts;
  },

  /**
   * Fetch units for a user with optional filter (active / archived / all).
   */
  async getUnits(userId: string, filter: ProductUnitFilter = 'active'): Promise<ProductUnit[]> {
    if (!userId) return [];

    let units = getLocalUnits(userId);
    if (units.length === 0) {
      units = await this.ensureDefaultUnits(userId);
    }

    const productCounts = await this.getUnitProductCounts(userId);

    try {
      let query = supabase
        .from('product_units')
        .select('*')
        .eq('user_id', userId);

      if (filter === 'active') {
        query = query.eq('is_archived', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      }

      const { data, error } = await query;

      if (!error && data) {
        const remoteList = data as ProductUnit[];
        // Update local cache
        const allLocal = getLocalUnits(userId);
        const mergedMap = new Map<string, ProductUnit>();
        allLocal.forEach((u) => mergedMap.set(u.id, u));
        remoteList.forEach((u) => mergedMap.set(u.id, u));
        setLocalUnits(userId, Array.from(mergedMap.values()));

        units = remoteList;
      }
    } catch (err: any) {
      console.warn('productUnitService.getUnits network warning:', err?.message || err);
    }

    if (filter === 'active') {
      units = units.filter((u) => !u.is_archived);
    } else if (filter === 'archived') {
      units = units.filter((u) => u.is_archived);
    }

    // Attach product_count
    return units.map((u) => {
      const count = (productCounts[u.id] || 0) + (productCounts[u.name] || 0) + (u.symbol ? (productCounts[u.symbol] || 0) : 0);
      return {
        ...u,
        product_count: count,
      };
    });
  },

  /**
   * Check if a unit name exists for the given user (case-insensitive, trimmed).
   */
  async checkNameExists(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    const localUnits = getLocalUnits(userId);
    const existsLocally = localUnits.some(
      (u) => u.id !== excludeId && u.name.trim().toLowerCase() === trimmed
    );
    if (existsLocally) return true;

    try {
      let query = supabase
        .from('product_units')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', trimmed);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data } = await query;
      if (data && data.length > 0) return true;
    } catch {}

    return false;
  },

  /**
   * Create a new custom unit.
   */
  async createUnit(userId: string, input: CreateProductUnitInput): Promise<ProductUnit> {
    if (!input.name || !input.name.trim()) {
      throw new Error(KHMER_MESSAGES.NAME_REQUIRED);
    }

    const trimmedName = input.name.trim();

    const isDuplicate = await this.checkNameExists(userId, trimmedName);
    if (isDuplicate) {
      throw new Error(KHMER_MESSAGES.NAME_DUPLICATE);
    }

    const now = new Date().toISOString();
    const localId = `unit_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUnit: ProductUnit = {
      id: localId,
      user_id: userId,
      name: trimmedName,
      symbol: input.symbol?.trim() || trimmedName,
      description: input.description?.trim() || null,
      is_default: false,
      is_archived: false,
      created_at: now,
      updated_at: now,
    };

    const currentUnits = getLocalUnits(userId);
    setLocalUnits(userId, [newUnit, ...currentUnits]);

    try {
      const { data, error } = await supabase
        .from('product_units')
        .insert({
          user_id: userId,
          name: trimmedName,
          symbol: input.symbol?.trim() || trimmedName,
          description: input.description?.trim() || null,
          is_default: false,
          is_archived: false,
        })
        .select('*')
        .single();

      if (!error && data) {
        const savedUnit = data as ProductUnit;
        const updatedList = getLocalUnits(userId).map((u) => (u.id === localId ? savedUnit : u));
        setLocalUnits(userId, updatedList);
        return savedUnit;
      }
    } catch (err: any) {
      console.warn('productUnitService.createUnit network warning:', err?.message || err);
    }

    return newUnit;
  },

  /**
   * Update an existing product unit.
   */
  async updateUnit(id: string, userId: string, input: UpdateProductUnitInput): Promise<ProductUnit> {
    const currentUnits = getLocalUnits(userId);
    const existing = currentUnits.find((u) => u.id === id);

    if (input.name && input.name.trim()) {
      const trimmedName = input.name.trim();
      if (existing && existing.name.trim().toLowerCase() !== trimmedName.toLowerCase()) {
        const isDuplicate = await this.checkNameExists(userId, trimmedName, id);
        if (isDuplicate) {
          throw new Error(KHMER_MESSAGES.NAME_DUPLICATE);
        }
      }
    }

    const now = new Date().toISOString();
    const updatedLocal: ProductUnit = {
      ...(existing || {
        id,
        user_id: userId,
        is_default: false,
        is_archived: false,
        created_at: now,
      }),
      name: input.name?.trim() ?? existing?.name ?? '',
      symbol: input.symbol !== undefined ? input.symbol.trim() : existing?.symbol,
      description: input.description !== undefined ? input.description.trim() : existing?.description,
      is_archived: input.is_archived !== undefined ? input.is_archived : existing?.is_archived ?? false,
      updated_at: now,
    };

    const updatedList = currentUnits.map((u) => (u.id === id ? updatedLocal : u));
    setLocalUnits(userId, updatedList);

    try {
      const { data, error } = await supabase
        .from('product_units')
        .update({
          name: updatedLocal.name,
          symbol: updatedLocal.symbol,
          description: updatedLocal.description,
          is_archived: updatedLocal.is_archived,
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        return data as ProductUnit;
      }
    } catch (err: any) {
      console.warn('productUnitService.updateUnit network warning:', err?.message || err);
    }

    return updatedLocal;
  },

  /**
   * Check if unit is referenced by any product.
   */
  async checkUnitInUse(id: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('unit_id', id);

      if (!error && typeof count === 'number') {
        return count;
      }
    } catch {}

    // Fallback: check local products if stored in localStorage
    try {
      const rawProducts = localStorage.getItem(`wyn_products_${userId}`);
      if (rawProducts) {
        const list = JSON.parse(rawProducts);
        if (Array.isArray(list)) {
          return list.filter((p: any) => p.unit_id === id).length;
        }
      }
    } catch {}

    return 0;
  },

  /**
   * Archive a product unit. System default units or units in use cannot be archived.
   */
  async archiveUnit(id: string, userId: string): Promise<ProductUnit> {
    const units = getLocalUnits(userId);
    const unit = units.find((u) => u.id === id);

    if (unit?.is_default) {
      throw new Error(KHMER_MESSAGES.SYSTEM_UNIT_NO_DELETE);
    }

    const inUseCount = await this.checkUnitInUse(id, userId);
    if (inUseCount > 0) {
      throw new Error(KHMER_MESSAGES.UNIT_IN_USE);
    }

    return this.updateUnit(id, userId, { is_archived: true });
  },

  /**
   * Unarchive a product unit.
   */
  async unarchiveUnit(id: string, userId: string): Promise<ProductUnit> {
    return this.updateUnit(id, userId, { is_archived: false });
  },
};
