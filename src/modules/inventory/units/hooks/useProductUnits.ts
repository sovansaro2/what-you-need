import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProductUnit, CreateProductUnitInput, UpdateProductUnitInput, ProductUnitFilter } from '../types';
import { productUnitService } from '../services/productUnitService';

export function useProductUnits(initialFilter: ProductUnitFilter = 'active') {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProductUnitFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchUnits = useCallback(
    async (targetFilter: ProductUnitFilter = filter) => {
      setLoading(true);
      setError(null);
      try {
        const data = await productUnitService.getUnits(userId, targetFilter);
        setUnits(data);
      } catch (err: any) {
        setError(err?.message || 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ');
      } finally {
        setLoading(false);
      }
    },
    [userId, filter]
  );

  useEffect(() => {
    fetchUnits(filter);
  }, [fetchUnits, filter]);

  const addUnit = async (input: CreateProductUnitInput): Promise<{ success: boolean; data?: ProductUnit; error?: string }> => {
    setActionLoading(true);
    setError(null);
    try {
      const created = await productUnitService.createUnit(userId, input);
      await fetchUnits(filter);
      return { success: true, data: created };
    } catch (err: any) {
      const msg = err?.message || 'បរាជ័យក្នុងការបន្ថែមខ្នាតទំនិញ';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const editUnit = async (
    id: string,
    input: UpdateProductUnitInput
  ): Promise<{ success: boolean; data?: ProductUnit; error?: string }> => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await productUnitService.updateUnit(id, userId, input);
      await fetchUnits(filter);
      return { success: true, data: updated };
    } catch (err: any) {
      const msg = err?.message || 'បរាជ័យក្នុងការកែប្រែខ្នាតទំនិញ';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const archiveUnit = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoading(true);
    setError(null);
    try {
      await productUnitService.archiveUnit(id, userId);
      await fetchUnits(filter);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'បរាជ័យក្នុងការដាក់ចូលប័ណ្ណសារ';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const unarchiveUnit = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoading(true);
    setError(null);
    try {
      await productUnitService.unarchiveUnit(id, userId);
      await fetchUnits(filter);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'បរាជ័យក្នុងការយកចេញពីប័ណ្ណសារ';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  // Sort units according to Priority 1 (System Default), Priority 2 (Custom Active), Priority 3 (Archived), then alphabetically in Khmer
  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      const getPriority = (u: ProductUnit) => {
        if (u.is_archived) return 3;
        if (u.is_default) return 1;
        return 2;
      };

      const prioA = getPriority(a);
      const prioB = getPriority(b);

      if (prioA !== prioB) {
        return prioA - prioB;
      }

      return a.name.localeCompare(b.name, 'km', { sensitivity: 'base' });
    });
  }, [units]);

  // Enhanced search supporting Khmer Name, English/Symbol keywords, and Description
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return sortedUnits;
    const query = searchQuery.trim().toLowerCase();

    return sortedUnits.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(query);
      const symbolMatch = u.symbol ? u.symbol.toLowerCase().includes(query) : false;
      const descMatch = u.description ? u.description.toLowerCase().includes(query) : false;

      // English aliases mapping for default Khmer unit terms
      let aliasMatch = false;
      if (query === 'bottle' && u.name.includes('ដប')) aliasMatch = true;
      if (query === 'can' && u.name.includes('កំប៉ុង')) aliasMatch = true;
      if ((query === 'pack' || query === 'package') && u.name.includes('កញ្ចប់')) aliasMatch = true;
      if (query === 'box' && u.name.includes('ប្រអប់')) aliasMatch = true;
      if ((query === 'kg' || query === 'kilogram') && u.name.includes('គីឡូ')) aliasMatch = true;
      if ((query === 'g' || query === 'gram') && u.name.includes('ក្រាម')) aliasMatch = true;
      if ((query === 'l' || query === 'liter' || query === 'litre') && u.name.includes('លីត្រ')) aliasMatch = true;
      if ((query === 'pcs' || query === 'piece' || query === 'unit') && (u.name.includes('ដើម') || u.name.includes('គ្រឿង') || u.name.includes('គ្រាប់'))) aliasMatch = true;

      return nameMatch || symbolMatch || descMatch || aliasMatch;
    });
  }, [sortedUnits, searchQuery]);

  return {
    units: filteredUnits,
    allLoadedUnits: units,
    loading,
    actionLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    fetchUnits,
    addUnit,
    editUnit,
    archiveUnit,
    unarchiveUnit,
    setError,
  };
}
