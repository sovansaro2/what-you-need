import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from './useCart';
import { customerService } from '../services/customerService';
import { salesService } from '../services/salesService';
import { Customer, CreateCustomerInput, ProcessSaleResult } from '../types';
import { InventoryProduct } from '../../inventory/products/types';
import { productService } from '../../inventory/products/services/productService';
import { productCategoryService } from '../../inventory/categories/services/productCategoryService';
import { ProductCategory } from '../../inventory/categories/types';

import { seedService } from '@/core/seed';

export function usePOS(userId: string) {
  const cart = useCart();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingSale, setProcessingSale] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<ProcessSaleResult | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Load initial catalog and customers (seeding defaults if needed)
  const loadInitialData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      await seedService.seedDefaultBusinessData(userId);

      const [prodsData, catsData, custsData] = await Promise.all([
        productService.getProducts(userId),
        productCategoryService.getCategories(userId),
        customerService.getCustomers(userId),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setCustomers(custsData || []);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        p.category_id === selectedCategory ||
        p.category === selectedCategory;

      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle barcode quick scan (exact match on barcode)
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      if (!barcode.trim()) return false;
      const match = products.find(
        (p) => p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase().trim()
      );
      if (match) {
        return cart.addToCart(match, 1);
      }
      return false;
    },
    [products, cart]
  );

  // Add new customer
  const handleCreateCustomer = useCallback(
    async (input: CreateCustomerInput) => {
      try {
        const newCust = await customerService.createCustomer(userId, input);
        setCustomers((prev) => [...prev, newCust]);
        cart.setCustomer(newCust);
        setIsCustomerModalOpen(false);
        return newCust;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to create customer');
      }
    },
    [userId, cart]
  );

  // Submit sale transaction
  const handleCheckout = useCallback(async () => {
    try {
      setProcessingSale(true);

      const items = cart.cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
      }));

      const payload = {
        customer_id: cart.customer.id,
        customer_name: cart.customer.name,
        payment_method: cart.paymentMethod,
        paid_amount: cart.paidAmount > 0 ? cart.paidAmount : cart.totals.total_amount,
        discount_amount: cart.discountAmount,
        tax_amount: cart.taxAmount,
        notes: cart.notes,
        items,
      };

      const result = await salesService.processSale(userId, payload);

      setCompletedSale(result);
      setIsReceiptModalOpen(true);

      // Refresh product catalog stock levels
      await loadInitialData();

      return result;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to complete checkout');
    } finally {
      setProcessingSale(false);
    }
  }, [userId, cart, loadInitialData]);

  // Reset checkout for next sale
  const startNewSale = useCallback(() => {
    cart.clearCart();
    setCompletedSale(null);
    setIsReceiptModalOpen(false);
  }, [cart]);

  return {
    cart,
    products,
    categories,
    customers,
    filteredProducts,
    loading,
    processingSale,
    completedSale,
    searchQuery,
    selectedCategory,
    isCustomerModalOpen,
    isReceiptModalOpen,

    setSearchQuery,
    setSelectedCategory,
    setIsCustomerModalOpen,
    setIsReceiptModalOpen,

    handleBarcodeScan,
    handleCreateCustomer,
    handleCheckout,
    startNewSale,
    refreshCatalog: loadInitialData,
  };
}
