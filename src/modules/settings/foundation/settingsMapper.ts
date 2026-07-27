import { BusinessSettings, UserPreferences } from '../types';

export const settingsMapper = {
  /**
   * Maps database record (business_profiles / business_settings) to BusinessSettings domain model.
   */
  mapDbToBusinessSettings(record: any, userId: string, businessId?: string): BusinessSettings {
    if (!record) {
      return {
        userId,
        businessId: businessId || userId,
        businessName: '',
        logoUrl: '',
        phone: '',
        email: '',
        address: '',
        primaryCurrency: 'KHR',
        timezone: 'Asia/Phnom_Penh',
        language: 'km',
        receiptPrefix: 'INV-',
        taxRate: 0,
        decimalPrecision: 2,
        lowStockThreshold: 5,
      };
    }

    return {
      id: record.id,
      userId: record.user_id || userId,
      businessId: record.business_id || businessId || userId,
      businessName: record.business_name || record.name || record.business_title || '',
      logoUrl: record.logo_url || record.avatar_url || '',
      phone: record.phone || record.contact_phone || '',
      email: record.email || record.contact_email || '',
      address: record.address || record.location || '',
      primaryCurrency: (record.primary_currency || record.currency) === 'USD' ? 'USD' : 'KHR',
      timezone: record.timezone || 'Asia/Phnom_Penh',
      language: record.language || 'km',
      receiptPrefix: record.receipt_prefix || 'INV-',
      taxRate: Number(record.tax_rate ?? 0),
      decimalPrecision: Number(record.decimal_precision ?? 2),
      lowStockThreshold: Number(record.low_stock_threshold ?? 5),
      updatedAt: record.updated_at,
    };
  },

  /**
   * Maps Partial<BusinessSettings> to database payload object.
   */
  mapBusinessSettingsToDbPayload(settings: Partial<BusinessSettings>, userId: string, businessId: string) {
    const payload: Record<string, any> = {
      business_id: businessId,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (settings.businessName !== undefined) payload.business_name = settings.businessName;
    if (settings.logoUrl !== undefined) payload.logo_url = settings.logoUrl || null;
    if (settings.phone !== undefined) payload.phone = settings.phone || null;
    if (settings.email !== undefined) payload.email = settings.email || null;
    if (settings.address !== undefined) payload.address = settings.address || null;
    if (settings.primaryCurrency !== undefined) payload.primary_currency = settings.primaryCurrency;
    if (settings.timezone !== undefined) payload.timezone = settings.timezone;
    if (settings.language !== undefined) payload.language = settings.language;
    if (settings.receiptPrefix !== undefined) payload.receipt_prefix = settings.receiptPrefix;
    if (settings.taxRate !== undefined) payload.tax_rate = settings.taxRate;
    if (settings.decimalPrecision !== undefined) payload.decimal_precision = settings.decimalPrecision;
    if (settings.lowStockThreshold !== undefined) payload.low_stock_threshold = settings.lowStockThreshold;

    return payload;
  },

  /**
   * Maps database record to UserPreferences domain model.
   */
  mapDbToUserPreferences(record: any, userId: string): UserPreferences {
    if (!record) {
      return {
        userId,
        theme: 'light',
        lowStockAlert: true,
        salesNotifications: true,
        reportNotifications: true,
      };
    }

    return {
      id: record.id,
      userId: record.user_id || userId,
      theme: 'light',
      lowStockAlert: record.low_stock_alert ?? true,
      salesNotifications: record.sales_notifications ?? true,
      reportNotifications: record.report_notifications ?? true,
      updatedAt: record.updated_at,
    };
  },

  /**
   * Maps UserPreferences model to database payload object.
   */
  mapUserPreferencesToDbPayload(prefs: Partial<UserPreferences>, userId: string) {
    return {
      user_id: userId,
      theme: 'light',
      low_stock_alert: prefs.lowStockAlert ?? true,
      sales_notifications: prefs.salesNotifications ?? true,
      report_notifications: prefs.reportNotifications ?? true,
      updated_at: new Date().toISOString(),
    };
  },
};
