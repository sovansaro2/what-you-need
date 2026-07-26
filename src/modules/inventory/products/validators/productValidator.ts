import { CreateInventoryProductInput, UpdateInventoryProductInput } from '../types';
import { KHMER_PRODUCT_MESSAGES } from '../constants';

export interface ProductValidationError {
  field: string;
  message: string;
}

export const productValidator = {
  validateCreate(input: CreateInventoryProductInput): ProductValidationError[] {
    const errors: ProductValidationError[] = [];

    if (!input.name || !input.name.trim()) {
      errors.push({ field: 'name', message: KHMER_PRODUCT_MESSAGES.NAME_REQUIRED });
    }

    if (!input.unit || !input.unit.trim()) {
      errors.push({ field: 'unit', message: KHMER_PRODUCT_MESSAGES.UNIT_REQUIRED });
    }

    if (!input.category || !input.category.trim()) {
      errors.push({ field: 'category', message: KHMER_PRODUCT_MESSAGES.CATEGORY_REQUIRED });
    }

    if (input.cost_price === undefined || input.cost_price === null || isNaN(input.cost_price) || input.cost_price < 0) {
      errors.push({ field: 'cost_price', message: KHMER_PRODUCT_MESSAGES.COST_PRICE_INVALID });
    }

    if (input.selling_price === undefined || input.selling_price === null || isNaN(input.selling_price) || input.selling_price < 0) {
      errors.push({ field: 'selling_price', message: KHMER_PRODUCT_MESSAGES.SELLING_PRICE_INVALID });
    }

    if (input.min_stock_alert !== undefined && input.min_stock_alert !== null && input.min_stock_alert < 0) {
      errors.push({ field: 'min_stock_alert', message: KHMER_PRODUCT_MESSAGES.MIN_STOCK_INVALID });
    }

    return errors;
  },

  validateUpdate(input: UpdateInventoryProductInput): ProductValidationError[] {
    const errors: ProductValidationError[] = [];

    if (input.name !== undefined && (!input.name || !input.name.trim())) {
      errors.push({ field: 'name', message: KHMER_PRODUCT_MESSAGES.NAME_REQUIRED });
    }

    if (input.unit !== undefined && (!input.unit || !input.unit.trim())) {
      errors.push({ field: 'unit', message: KHMER_PRODUCT_MESSAGES.UNIT_REQUIRED });
    }

    if (input.category !== undefined && (!input.category || !input.category.trim())) {
      errors.push({ field: 'category', message: KHMER_PRODUCT_MESSAGES.CATEGORY_REQUIRED });
    }

    if (input.cost_price !== undefined && (isNaN(input.cost_price) || input.cost_price < 0)) {
      errors.push({ field: 'cost_price', message: KHMER_PRODUCT_MESSAGES.COST_PRICE_INVALID });
    }

    if (input.selling_price !== undefined && (isNaN(input.selling_price) || input.selling_price < 0)) {
      errors.push({ field: 'selling_price', message: KHMER_PRODUCT_MESSAGES.SELLING_PRICE_INVALID });
    }

    if (input.min_stock_alert !== undefined && input.min_stock_alert !== null && input.min_stock_alert < 0) {
      errors.push({ field: 'min_stock_alert', message: KHMER_PRODUCT_MESSAGES.MIN_STOCK_INVALID });
    }

    return errors;
  },
};
