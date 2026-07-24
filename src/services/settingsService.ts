import { supabase } from '@/lib/supabase';
import { BusinessSettings, UserPreferences } from '@/modules/settings/types';

const STORAGE_KEY_SETTINGS = 'wyn_business_settings_';
const STORAGE_KEY_PREFERENCES = 'wyn_user_preferences_';

export const settingsService = {
  // Fetch Business Settings
  async getBusinessSettings(userId: string): Promise<BusinessSettings> {
    const defaultSettings: BusinessSettings = {
      userId,
      businessName: '',
      logoUrl: '',
      phone: '',
      email: '',
      address: '',
      primaryCurrency: 'KHR',
      language: 'km',
    };

    // Try reading local storage first as fast cache/fallback
    try {
      const local = localStorage.getItem(`${STORAGE_KEY_SETTINGS}${userId}`);
      if (local) {
        Object.assign(defaultSettings, JSON.parse(local));
      }
    } catch {
      // Ignore local storage error
    }

    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        const remoteSettings: BusinessSettings = {
          id: data.id,
          userId: data.user_id,
          businessName: data.business_name || defaultSettings.businessName,
          logoUrl: data.logo_url || defaultSettings.logoUrl,
          phone: data.phone || defaultSettings.phone,
          email: data.email || defaultSettings.email,
          address: data.address || defaultSettings.address,
          primaryCurrency: data.primary_currency || defaultSettings.primaryCurrency,
          language: data.language || 'km',
          updatedAt: data.updated_at,
        };
        // Update local cache
        localStorage.setItem(`${STORAGE_KEY_SETTINGS}${userId}`, JSON.stringify(remoteSettings));
        return remoteSettings;
      }
    } catch (err) {
      console.warn('Supabase business_settings table not available or error:', err);
    }

    return defaultSettings;
  },

  // Save/Update Business Settings
  async updateBusinessSettings(userId: string, payload: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getBusinessSettings(userId);
    const updated: BusinessSettings = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    // Always update local cache immediately
    try {
      localStorage.setItem(`${STORAGE_KEY_SETTINGS}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }

    // Try saving to Supabase if table exists
    try {
      const dbPayload = {
        user_id: userId,
        business_name: updated.businessName,
        logo_url: updated.logoUrl || null,
        phone: updated.phone || null,
        email: updated.email || null,
        address: updated.address || null,
        primary_currency: updated.primaryCurrency,
        language: 'km',
        updated_at: updated.updatedAt,
      };

      const { data, error } = await supabase
        .from('business_settings')
        .upsert(dbPayload, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      if (!error && data) {
        updated.id = data.id;
      }
    } catch (err) {
      console.warn('Unable to upsert business_settings to Supabase:', err);
    }

    return updated;
  },

  // Fetch User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const defaultPreferences: UserPreferences = {
      userId,
      theme: 'light',
      lowStockAlert: true,
      salesNotifications: true,
      reportNotifications: true,
    };

    try {
      const local = localStorage.getItem(`${STORAGE_KEY_PREFERENCES}${userId}`);
      if (local) {
        Object.assign(defaultPreferences, JSON.parse(local));
      }
    } catch {
      // Ignore
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        const remotePrefs: UserPreferences = {
          id: data.id,
          userId: data.user_id,
          theme: 'light',
          lowStockAlert: data.low_stock_alert ?? true,
          salesNotifications: data.sales_notifications ?? true,
          reportNotifications: data.report_notifications ?? true,
          updatedAt: data.updated_at,
        };
        localStorage.setItem(`${STORAGE_KEY_PREFERENCES}${userId}`, JSON.stringify(remotePrefs));
        return remotePrefs;
      }
    } catch (err) {
      console.warn('Supabase user_preferences table not available:', err);
    }

    return defaultPreferences;
  },

  // Update User Preferences
  async updateUserPreferences(userId: string, payload: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getUserPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFERENCES}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preferences to local storage:', e);
    }

    try {
      const dbPayload = {
        user_id: userId,
        theme: 'light',
        low_stock_alert: updated.lowStockAlert,
        sales_notifications: updated.salesNotifications,
        report_notifications: updated.reportNotifications,
        updated_at: updated.updatedAt,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(dbPayload, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      if (!error && data) {
        updated.id = data.id;
      }
    } catch (err) {
      console.warn('Unable to upsert user_preferences to Supabase:', err);
    }

    return updated;
  },
};
