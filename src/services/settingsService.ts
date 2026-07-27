import { settingsRepository } from '@/modules/settings/foundation';
import { BusinessSettings, UserPreferences } from '@/modules/settings/types';

export const settingsService = {
  /**
   * Fetch Business Settings from database-authoritative repository
   */
  async getBusinessSettings(userId: string, businessId?: string): Promise<BusinessSettings> {
    return settingsRepository.getBusinessSettings(userId, businessId);
  },

  /**
   * Save/Update Business Settings in Supabase database
   */
  async updateBusinessSettings(
    userId: string,
    payload: Partial<BusinessSettings>,
    businessId?: string
  ): Promise<BusinessSettings> {
    return settingsRepository.updateBusinessSettings(userId, payload, businessId);
  },

  /**
   * Fetch User Preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return settingsRepository.getUserPreferences(userId);
  },

  /**
   * Update User Preferences
   */
  async updateUserPreferences(userId: string, payload: Partial<UserPreferences>): Promise<UserPreferences> {
    return settingsRepository.updateUserPreferences(userId, payload);
  },
};
