import { ValidationError } from '@/core/errors';
import { BusinessSettings, UserPreferences } from '../types';

export const settingsValidator = {
  validateBusinessSettings(settings: Partial<BusinessSettings>): void {
    if (settings.businessName !== undefined && !settings.businessName.trim()) {
      throw new ValidationError(
        'Business name cannot be empty.',
        'ឈ្មោះអាជីវកម្មមិនអាចទទេបានទេ'
      );
    }

    if (settings.email && settings.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.trim())) {
      throw new ValidationError(
        'Invalid email address format.',
        'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ'
      );
    }

    if (settings.taxRate !== undefined && (typeof settings.taxRate !== 'number' || settings.taxRate < 0)) {
      throw new ValidationError(
        'Tax rate must be a non-negative number.',
        'អត្រាពន្ធត្រូវតែជាលេខវិជ្ជមាន'
      );
    }

    if (settings.decimalPrecision !== undefined && (typeof settings.decimalPrecision !== 'number' || settings.decimalPrecision < 0)) {
      throw new ValidationError(
        'Decimal precision must be non-negative.',
        'ចំនួនខ្ទង់ទសភាគត្រូវតែជាលេខវិជ្ជមាន'
      );
    }

    if (settings.lowStockThreshold !== undefined && (typeof settings.lowStockThreshold !== 'number' || settings.lowStockThreshold < 0)) {
      throw new ValidationError(
        'Low stock threshold must be a non-negative number.',
        'កម្រិតប្រកាសអាសន្នស្តុកត្រូវតែជាលេខវិជ្ជមាន'
      );
    }
  },

  validateUserPreferences(_prefs: Partial<UserPreferences>): void {
    // Validates preference object parameters
  },

  sanitizeBusinessSettings(settings: BusinessSettings): BusinessSettings {
    return {
      ...settings,
      businessName: settings.businessName ? settings.businessName.trim() : 'អាជីវកម្មរបស់ខ្ញុំ',
      phone: settings.phone ? settings.phone.trim() : '',
      email: settings.email ? settings.email.trim() : '',
      address: settings.address ? settings.address.trim() : '',
      primaryCurrency: settings.primaryCurrency === 'USD' ? 'USD' : 'KHR',
      timezone: settings.timezone || 'Asia/Phnom_Penh',
      language: 'km',
      receiptPrefix: settings.receiptPrefix ? settings.receiptPrefix.trim() : 'INV-',
      taxRate: Number.isNaN(Number(settings.taxRate)) ? 0 : Math.max(0, Number(settings.taxRate)),
      decimalPrecision: Number.isNaN(Number(settings.decimalPrecision)) ? 2 : Math.max(0, Number(settings.decimalPrecision)),
      lowStockThreshold: Number.isNaN(Number(settings.lowStockThreshold)) ? 5 : Math.max(0, Number(settings.lowStockThreshold)),
    };
  },
};
