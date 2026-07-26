import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  InventoryProduct,
  CreateInventoryProductInput,
  UpdateInventoryProductInput,
  ProductFilter,
} from '../types';
import { productService } from '../services/productService';
import { DEFAULT_MIN_STOCK_ALERT } from '../constants';

export const useInventoryProducts = (initialFilter?: ProductFilter) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [rawProducts, setRawProducts] = useState<InventoryProduct[]>([]);
  const [filter, setFilter] = useState<ProductFilter>(initialFilter || { status: 'all' });
  const [searchQuery, setSearchQuery] = useState(initialFilter?.searchQuery || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(userId, { status: 'all' });
      setRawProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch inventory products:', err);
      setError(err?.message || 'មិនអាចទាញយកបញ្ជីទំនិញបានទេ');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (input: CreateInventoryProductInput): Promise<InventoryProduct> => {
    const created = await productService.createProduct(userId, input);
    await fetchProducts();
    return created;
  };

  const updateProduct = async (
    id: string,
    input: UpdateInventoryProductInput
  ): Promise<InventoryProduct> => {
    const updated = await productService.updateProduct(userId, id, input);
    await fetchProducts();
    return updated;
  };

  const archiveProduct = async (id: string): Promise<InventoryProduct> => {
    const archived = await productService.archiveProduct(userId, id);
    await fetchProducts();
    return archived;
  };

  const unarchiveProduct = async (id: string): Promise<InventoryProduct> => {
    const unarchived = await productService.unarchiveProduct(userId, id);
    await fetchProducts();
    return unarchived;
  };

  const checkSkuDuplicate = useCallback(
    async (sku: string, excludeProductId?: string): Promise<boolean> => {
      return productService.isSkuDuplicate(userId, sku, excludeProductId);
    },
    [userId]
  );

  const getProductById = useCallback(
    async (id: string): Promise<InventoryProduct | null> => {
      return productService.getProductById(userId, id);
    },
    [userId]
  );

  // Memoized stats & metrics
  const stats = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let archived = 0;
    let activeTotal = 0;

    rawProducts.forEach((p) => {
      if (p.is_archived) {
        archived++;
        return;
      }

      activeTotal++;
      const minAlert = p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;

      if (p.current_stock <= 0) {
        outOfStock++;
      } else if (p.current_stock <= minAlert) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      total: rawProducts.length,
      activeTotal,
      inStock,
      lowStock,
      outOfStock,
      archived,
    };
  }, [rawProducts]);

  // Memoized filtered and sorted list
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Status filtering
    const status = filter.status || 'all';
    if (status === 'in_stock') {
      result = result.filter(
        (p) => !p.is_archived && p.current_stock > (p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT)
      );
    } else if (status === 'low_stock') {
      result = result.filter(
        (p) =>
          !p.is_archived &&
          p.current_stock > 0 &&
          p.current_stock <= (p.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT)
      );
    } else if (status === 'out_of_stock') {
      result = result.filter((p) => !p.is_archived && p.current_stock <= 0);
    } else if (status === 'archived') {
      result = result.filter((p) => p.is_archived);
    } else if (status === 'all') {
      result = result.filter((p) => !p.is_archived);
    }

    // Category filter
    if (filter.category) {
      const cat = filter.category.trim().toLowerCase();
      result = result.filter(
        (p) => p.category.trim().toLowerCase() === cat || p.category_id === filter.category
      );
    }

    // Unit filter
    if (filter.unit) {
      const u = filter.unit.trim().toLowerCase();
      result = result.filter(
        (p) => p.unit.trim().toLowerCase() === u || p.unit_id === filter.unit
      );
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
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

    // Sort
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';

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
  }, [rawProducts, filter, searchQuery]);

  return {
    products: filteredProducts,
    rawProducts,
    loading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    stats,
    createProduct,
    updateProduct,
    archiveProduct,
    unarchiveProduct,
    checkSkuDuplicate,
    getProductById,
    refresh: fetchProducts,
  };
};

export const useProducts = useInventoryProducts;
