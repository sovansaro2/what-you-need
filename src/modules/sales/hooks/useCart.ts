import { useState, useMemo, useCallback } from 'react';
import { CartItem, CartTotals, Customer, PaymentMethod } from '../types';
import { DEFAULT_WALK_IN_CUSTOMER } from '../constants';
import { InventoryProduct } from '../../inventory/products/types';
import { salesValidator } from '../validators/salesValidator';

export interface UseCartReturn {
  cartItems: CartItem[];
  customer: Customer;
  discountAmount: number;
  taxAmount: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  notes: string;
  totals: CartTotals;
  validationError: string | null;

  addToCart: (product: InventoryProduct, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setItemDiscount: (productId: string, discount: number) => void;
  setOrderDiscount: (discount: number) => void;
  setOrderTax: (tax: number) => void;
  setCustomer: (customer: Customer) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaidAmount: (amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(DEFAULT_WALK_IN_CUSTOMER);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Computed Totals
  const totals: CartTotals = useMemo(() => {
    let itemCount = 0;
    let totalQuantity = 0;
    let subtotal = 0;
    let itemsDiscount = 0;

    for (const item of cartItems) {
      itemCount += 1;
      totalQuantity += item.quantity;
      subtotal += item.quantity * item.unit_price;
      itemsDiscount += item.discount_amount;
    }

    const totalDiscount = itemsDiscount + discountAmount;
    const grossTotal = Math.max(0, subtotal - totalDiscount + taxAmount);

    return {
      item_count: itemCount,
      total_quantity: totalQuantity,
      subtotal,
      discount_amount: totalDiscount,
      tax_amount: taxAmount,
      total_amount: grossTotal,
    };
  }, [cartItems, discountAmount, taxAmount]);

  // Add product to cart with stock validation
  const addToCart = useCallback((product: InventoryProduct, qty = 1): boolean => {
    setValidationError(null);
    if (!product || !product.id) return false;

    const availableStock = product.current_stock ?? 0;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === product.id);

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + qty;

        if (newQty > availableStock) {
          setValidationError(`ស្តុកមិនគ្រប់គ្រាន់ទេ! ${product.name} មានត្រឹមតែ ${availableStock}`);
          return prev;
        }

        const updated = [...prev];
        const sub = newQty * existing.unit_price;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: sub,
          total: Math.max(0, sub - existing.discount_amount),
          current_stock: availableStock,
        };
        return updated;
      } else {
        if (qty > availableStock) {
          setValidationError(`ស្តុកមិនគ្រប់គ្រាន់ទេ! ${product.name} មានត្រឹមតែ ${availableStock}`);
          return prev;
        }

        const unitPrice = Number(product.selling_price) || 0;
        const sub = qty * unitPrice;
        const newItem: CartItem = {
          id: product.id,
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku || null,
          product_barcode: product.barcode || null,
          unit_name: product.unit || null,
          current_stock: availableStock,
          quantity: qty,
          unit_price: unitPrice,
          discount_amount: 0,
          subtotal: sub,
          total: sub,
          cost_price: Number(product.cost_price) || 0,
        };
        return [...prev, newItem];
      }
    });

    return true;
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setValidationError(null);
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }

    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.current_stock) {
            setValidationError(`ស្តុកមិនគ្រប់គ្រាន់ទេ! ${item.product_name} មានត្រឹមតែ ${item.current_stock}`);
            return item;
          }
          const sub = quantity * item.unit_price;
          return {
            ...item,
            quantity,
            subtotal: sub,
            total: Math.max(0, sub - item.discount_amount),
          };
        }
        return item;
      });
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    setValidationError(null);
    setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  // Item discount
  const setItemDiscount = useCallback((productId: string, discount: number) => {
    const cleanDiscount = Math.max(0, discount);
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            discount_amount: cleanDiscount,
            total: Math.max(0, item.subtotal - cleanDiscount),
          };
        }
        return item;
      })
    );
  }, []);

  // Order discount
  const setOrderDiscount = useCallback((discount: number) => {
    setDiscountAmount(Math.max(0, discount));
  }, []);

  // Order tax
  const setOrderTax = useCallback((tax: number) => {
    setTaxAmount(Math.max(0, tax));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setCustomer(DEFAULT_WALK_IN_CUSTOMER);
    setDiscountAmount(0);
    setTaxAmount(0);
    setPaymentMethod('cash');
    setPaidAmount(0);
    setNotes('');
    setValidationError(null);
  }, []);

  return {
    cartItems,
    customer,
    discountAmount,
    taxAmount,
    paymentMethod,
    paidAmount,
    notes,
    totals,
    validationError,

    addToCart,
    updateQuantity,
    removeFromCart,
    setItemDiscount,
    setOrderDiscount,
    setOrderTax,
    setCustomer,
    setPaymentMethod,
    setPaidAmount,
    setNotes,
    clearCart,
  };
}
