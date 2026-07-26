import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProductCategory, CreateProductCategoryInput, UpdateProductCategoryInput, ProductCategoryFilter } from '../types';
import { productCategoryService } from '../services/productCategoryService';

export const useProductCategories = (initialFilter: ProductCategoryFilter = 'active') => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filter, setFilter] = useState<ProductCategoryFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productCategoryService.getCategories(userId, filter);
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch product categories:', err);
      setError(err?.message || 'មិនអាចទាញយកទិន្នន័យប្រភេទទំនិញបានទេ');
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (input: CreateProductCategoryInput): Promise<ProductCategory> => {
    const created = await productCategoryService.createCategory(userId, input);
    await fetchCategories();
    return created;
  };

  const updateCategory = async (id: string, input: UpdateProductCategoryInput): Promise<ProductCategory> => {
    const updated = await productCategoryService.updateCategory(userId, id, input);
    await fetchCategories();
    return updated;
  };

  const archiveCategory = async (id: string): Promise<ProductCategory> => {
    const archived = await productCategoryService.archiveCategory(userId, id);
    await fetchCategories();
    return archived;
  };

  const unarchiveCategory = async (id: string): Promise<ProductCategory> => {
    const unarchived = await productCategoryService.unarchiveCategory(userId, id);
    await fetchCategories();
    return unarchived;
  };

  // Sort categories: Priority 1 (Default), Priority 2 (Custom Active), Priority 3 (Archived), then alphabetically in Khmer
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const getPriority = (c: ProductCategory) => {
        if (c.is_archived) return 3;
        if (c.is_default) return 1;
        return 2;
      };

      const prioA = getPriority(a);
      const prioB = getPriority(b);

      if (prioA !== prioB) {
        return prioA - prioB;
      }

      return a.name.localeCompare(b.name, 'km', { sensitivity: 'base' });
    });
  }, [categories]);

  // Enhanced search supporting Khmer name and description
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories;
    const query = searchQuery.trim().toLowerCase();

    return sortedCategories.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query);
      const descMatch = c.description ? c.description.toLowerCase().includes(query) : false;
      return nameMatch || descMatch;
    });
  }, [sortedCategories, searchQuery]);

  return {
    categories: filteredCategories,
    rawCategories: categories,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    unarchiveCategory,
  };
};
