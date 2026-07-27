import { businessContext } from './businessContext';

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export const inventoryValidator = {
  validateBusinessId(businessId: string): ValidationErrorItem[] {
    if (!businessContext.validateBusinessId(businessId)) {
      return [{ field: 'business_id', message: 'business_id is required' }];
    }
    return [];
  },

  validateRequiredString(value: any, fieldName: string, label: string): ValidationErrorItem[] {
    if (!value || typeof value !== 'string' || !value.trim()) {
      return [{ field: fieldName, message: `${label} ត្រូវបានតម្រូវ` }];
    }
    return [];
  },

  validateNonNegativeNumber(value: any, fieldName: string, label: string): ValidationErrorItem[] {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return [{ field: fieldName, message: `${label} ត្រូវតែជាចំនួនវិជ្ជមាន` }];
      }
    }
    return [];
  },

  validateSku(sku?: string | null): ValidationErrorItem[] {
    if (sku && sku.trim().length > 100) {
      return [{ field: 'sku', message: 'SKU មិនអាចលើសពី ១០០ តួអក្សរទេ' }];
    }
    return [];
  },

  validateBarcode(barcode?: string | null): ValidationErrorItem[] {
    if (barcode && barcode.trim().length > 100) {
      return [{ field: 'barcode', message: 'បារកូដមិនអាចលើសពី ១០០ តួអក្សរទេ' }];
    }
    return [];
  },

  validateCategoryName(name?: string): ValidationErrorItem[] {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return [{ field: 'name', message: 'ឈ្មោះប្រភេទទំនិញត្រូវបានតម្រូវ' }];
    }
    return [];
  },

  validateUnitName(name?: string): ValidationErrorItem[] {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return [{ field: 'name', message: 'ឈ្មោះខ្នាតទំនិញត្រូវបានតម្រូវ' }];
    }
    return [];
  },
};
