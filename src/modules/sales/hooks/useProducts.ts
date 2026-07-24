import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { salesService } from '../services/salesService';
import { Product, CreateProductInput, UpdateProductInput } from '../types';

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await salesService.getProducts(user.id);
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'បរាជ័យក្នុងការទាញយកបញ្ជីទំនិញ');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (
    input: Omit<CreateProductInput, 'user_id'>
  ): Promise<Product | null> => {
    if (!user?.id) return null;
    try {
      const newProd = await salesService.createProduct({
        ...input,
        user_id: user.id,
      });
      setProducts((prev) => [newProd, ...prev]);
      return newProd;
    } catch (err: any) {
      console.error('Failed to add product:', err);
      setError(err.message || 'បរាជ័យក្នុងការបន្ថែមទំនិញ');
      return null;
    }
  };

  const editProduct = async (
    id: string,
    input: UpdateProductInput
  ): Promise<Product | null> => {
    try {
      const updated = await salesService.updateProduct(id, input);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setError(err.message || 'បរាជ័យក្នុងការកែប្រែទំនិញ');
      return null;
    }
  };

  const removeProduct = async (id: string): Promise<boolean> => {
    try {
      await salesService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'បរាជ័យក្នុងការលុបទំនិញ');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
};
