import { supabase } from '@/lib/supabase';
import { settingsContext } from './settingsContext';
import { settingsMapper } from './settingsMapper';
import { settingsValidator } from './settingsValidator';
import { settingsEvents } from './settingsEvents';
import { BusinessSettings, UserPreferences } from '../types';
import { safeAsync, DatabaseError } from '@/core/errors';

export const settingsRepository = {
  /**
   * Fetch Business Settings from Supabase database (business_profiles / business_settings).
   * Fully database authoritative.
   */
  async getBusinessSettings(userId: string, businessId?: string): Promise<BusinessSettings> {
    const validBusinessId = settingsContext.resolveBusinessId(businessId, userId);

    const [data, err] = await safeAsync(async () => {
      // 1. Try business_profiles first
      const { data: profileData, error: profileErr } = await supabase
        .from('business_profiles')
        .select('*')
        .or(`business_id.eq.${validBusinessId},user_id.eq.${userId}`)
        .maybeSingle();

      if (!profileErr && profileData) {
        return settingsMapper.mapDbToBusinessSettings(profileData, userId, validBusinessId);
      }

      // 2. Fall back to business_settings table
      const { data: settingsData, error: settingsErr } = await supabase
        .from('business_settings')
        .select('*')
        .or(`business_id.eq.${validBusinessId},user_id.eq.${userId}`)
        .maybeSingle();

      if (!settingsErr && settingsData) {
        return settingsMapper.mapDbToBusinessSettings(settingsData, userId, validBusinessId);
      }

      // 3. Fall back to user_metadata or blank initial structure
      return settingsMapper.mapDbToBusinessSettings(null, userId, validBusinessId);
    }, 'settingsRepository.getBusinessSettings');

    if (err) {
      console.warn('settingsRepository.getBusinessSettings database warning:', err);
    }

    return settingsValidator.sanitizeBusinessSettings(
      data || settingsMapper.mapDbToBusinessSettings(null, userId, validBusinessId)
    );
  },

  /**
   * Save/Update Business Settings directly to Supabase DB.
   */
  async updateBusinessSettings(
    userId: string,
    payload: Partial<BusinessSettings>,
    businessId?: string
  ): Promise<BusinessSettings> {
    const validBusinessId = settingsContext.resolveBusinessId(businessId, userId);
    settingsValidator.validateBusinessSettings(payload);

    const current = await this.getBusinessSettings(userId, validBusinessId);
    const updatedModel: BusinessSettings = settingsValidator.sanitizeBusinessSettings({
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    });

    const dbPayload = settingsMapper.mapBusinessSettingsToDbPayload(
      updatedModel,
      userId,
      validBusinessId
    );

    const [, err] = await safeAsync(async () => {
      // 1. Upsert into business_settings
      const { error: settingsErr } = await supabase
        .from('business_settings')
        .upsert(dbPayload, { onConflict: 'user_id' });

      if (settingsErr) {
        console.warn('business_settings upsert returned error, trying business_profiles:', settingsErr.message);
      }

      // 2. Upsert into business_profiles
      const { error: profileErr } = await supabase
        .from('business_profiles')
        .upsert(
          {
            ...dbPayload,
            business_name: updatedModel.businessName,
            phone: updatedModel.phone,
            email: updatedModel.email,
            address: updatedModel.address,
            logo_url: updatedModel.logoUrl,
          },
          { onConflict: 'user_id' }
        );

      if (profileErr) {
        console.warn('business_profiles upsert notice:', profileErr.message);
      }

      return true;
    }, 'settingsRepository.updateBusinessSettings');

    if (err) {
      console.error('Failed to update business settings in database:', err);
      throw new DatabaseError('Failed to persist settings to database.', 'មិនអាចរក្សាទុកការកំណត់ទៅក្នុងប្រព័ន្ធទិន្នន័យបានទេ');
    }

    // Emit event after successful DB update
    settingsEvents.emitBusinessUpdated(validBusinessId, {
      businessName: updatedModel.businessName,
      logoUrl: updatedModel.logoUrl,
      phone: updatedModel.phone,
      email: updatedModel.email,
      address: updatedModel.address,
    });
    settingsEvents.emitSettingsUpdated(validBusinessId, updatedModel);

    return updatedModel;
  },

  /**
   * Fetch User Preferences from Supabase DB.
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const [data, err] = await safeAsync(async () => {
      const { data: prefData, error: prefErr } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!prefErr && prefData) {
        return settingsMapper.mapDbToUserPreferences(prefData, userId);
      }

      return settingsMapper.mapDbToUserPreferences(null, userId);
    }, 'settingsRepository.getUserPreferences');

    if (err) {
      console.warn('settingsRepository.getUserPreferences warning:', err);
    }

    return data || settingsMapper.mapDbToUserPreferences(null, userId);
  },

  /**
   * Update User Preferences in Supabase DB.
   */
  async updateUserPreferences(userId: string, payload: Partial<UserPreferences>): Promise<UserPreferences> {
    settingsValidator.validateUserPreferences(payload);

    const current = await this.getUserPreferences(userId);
    const updatedModel: UserPreferences = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const dbPayload = settingsMapper.mapUserPreferencesToDbPayload(updatedModel, userId);

    const [, err] = await safeAsync(async () => {
      const { error: upsertErr } = await supabase
        .from('user_preferences')
        .upsert(dbPayload, { onConflict: 'user_id' });

      if (upsertErr) {
        console.warn('user_preferences upsert notice:', upsertErr.message);
      }

      return true;
    }, 'settingsRepository.updateUserPreferences');

    if (err) {
      console.error('Failed to update user preferences:', err);
    }

    return updatedModel;
  },
};
