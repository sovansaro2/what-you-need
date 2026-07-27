export interface BusinessSettings {
  id?: string;
  userId: string;
  businessId?: string;
  businessName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  primaryCurrency: 'KHR' | 'USD';
  timezone: string;
  language: 'km' | 'en';
  receiptPrefix: string;
  taxRate: number;
  decimalPrecision: number;
  lowStockThreshold: number;
  updatedAt?: string;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: 'light';
  lowStockAlert: boolean;
  salesNotifications: boolean;
  reportNotifications: boolean;
  updatedAt?: string;
}

export interface ChangePasswordPayload {
  newPassword: string;
  confirmPassword: string;
}
