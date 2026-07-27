import { CartItem, ProcessSaleInput, CreateCustomerInput } from '../types';
import { KHMER_SALES_MESSAGES } from '../constants';
import { InventoryProduct } from '../../inventory/products/types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const salesValidator = {
  /**
   * Validates cart items before proceeding to checkout
   */
  validateCart(cartItems: CartItem[]): ValidationResult {
    const errors: Record<string, string> = {};

    if (!cartItems || cartItems.length === 0) {
      errors.cart = KHMER_SALES_MESSAGES.EMPTY_CART;
      return { isValid: false, errors };
    }

    for (const item of cartItems) {
      if (!item.product_id) {
        errors[`item_${item.id}_product`] = KHMER_SALES_MESSAGES.PRODUCT_NOT_FOUND;
      }
      if (item.quantity <= 0) {
        errors[`item_${item.id}_qty`] = KHMER_SALES_MESSAGES.INVALID_QUANTITY;
      }
      if (item.quantity > item.current_stock) {
        errors[`item_${item.id}_stock`] = `${KHMER_SALES_MESSAGES.INSUFFICIENT_STOCK}: ${item.product_name} (មានត្រឹម ${item.current_stock})`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validates full sale processing payload against live product data
   */
  validateSalePayload(input: ProcessSaleInput, availableProducts: Map<string, InventoryProduct>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.items || input.items.length === 0) {
      errors.items = KHMER_SALES_MESSAGES.EMPTY_CART;
      return { isValid: false, errors };
    }

    let calculatedSubtotal = 0;

    for (let index = 0; index < input.items.length; index++) {
      const item = input.items[index];
      const product = availableProducts.get(item.product_id);

      if (!product) {
        errors[`item_${index}_not_found`] = `${KHMER_SALES_MESSAGES.PRODUCT_NOT_FOUND} (ID: ${item.product_id})`;
        continue;
      }

      if (item.quantity <= 0) {
        errors[`item_${index}_qty`] = `${product.name}: ${KHMER_SALES_MESSAGES.INVALID_QUANTITY}`;
      }

      if (item.quantity > (product.current_stock ?? 0)) {
        errors[`item_${index}_stock`] = `${product.name}: ${KHMER_SALES_MESSAGES.INSUFFICIENT_STOCK} (មានក្នុងស្តុក ${product.current_stock})`;
      }

      const itemSubtotal = item.quantity * item.unit_price;
      calculatedSubtotal += itemSubtotal;
    }

    const discount = Math.max(0, input.discount_amount || 0);
    const tax = Math.max(0, input.tax_amount || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal - discount + tax);

    if (input.paid_amount < 0) {
      errors.paid_amount = KHMER_SALES_MESSAGES.INVALID_PAID_AMOUNT;
    }

    if (input.payment_method !== 'credit' && input.paid_amount < calculatedTotal && (!input.customer_id || input.customer_id === 'walk-in')) {
      errors.credit_walkin = 'ការលក់ជំពាក់/បង់មិនគ្រប់ មិនអនុញ្ញាតសម្រាប់អតិថិជនទូទៅទេ (Partial/Credit sales require a registered customer)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validates new customer input payload
   */
  validateCustomerInput(input: CreateCustomerInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.name || !input.name.trim()) {
      errors.name = 'សូមបញ្ចូលឈ្មោះអតិថិជន (Customer name is required)';
    }

    if (input.phone && !/^[0-9+\s-]{8,15}$/.test(input.phone.trim())) {
      errors.phone = 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ (Invalid phone number format)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
