import { supabase } from '@/lib/supabase';
import { SignUpData, SignInData, UserProfile } from '@/types/auth';
import { settingsService } from '@/services/settingsService';

export const authService = {
  async signUp({ email, password, fullName, phone }: SignUpData) {
    const emailRedirectTo = `${window.location.origin}/login`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await this.ensureProfileExists(data.user.id, {
        full_name: fullName,
        phone: phone || null,
      });
    }

    return data;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPasswordForEmail(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // First attempt query by primary key `id` (standard Supabase profiles schema)
      const { data: dataById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (dataById) return dataById;

      // Fallback query by `user_id` column if present
      const { data: dataByUserId } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (dataByUserId) return dataByUserId;

      return null;
    } catch (err) {
      console.warn('Unable to fetch profile:', err);
      return null;
    }
  },

  async ensureProfileExists(userId: string, extraData?: { full_name?: string; phone?: string | null }) {
    try {
      const existing = await this.getProfile(userId);
      if (existing) return existing;

      const now = new Date().toISOString();
      const newProfile: Record<string, any> = {
        id: userId,
        full_name: extraData?.full_name || '',
        phone: extraData?.phone || null,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        // Try without optional fields if failed
        const { data: fallbackData } = await supabase
          .from('profiles')
          .insert({ id: userId, full_name: extraData?.full_name || '' })
          .select()
          .maybeSingle();

        if (fallbackData) return fallbackData;
        return await this.getProfile(userId);
      }
      return data;
    } catch (err) {
      console.warn('Error ensuring profile exists:', err);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: {
    full_name?: string;
    phone?: string | null;
    avatar_url?: string | null;
    address?: string | null;
    business_name?: string | null;
  }): Promise<{
    success: boolean;
    rowsUpdated: number;
    errorMessage?: string;
    verifiedProfile?: UserProfile | null;
    data?: any;
  }> {
    try {
      // 1. Get authenticated user from Supabase
      const { data: { user: authUser }, error: authUserErr } = await supabase.auth.getUser();
      const targetUserId = authUser?.id || userId;

      console.log('[PROFILE DEBUG] Step 1: Authenticated User ID:', authUser?.id);
      console.log('[PROFILE DEBUG] Step 1: Target user_id:', targetUserId);
      console.log('[PROFILE DEBUG] Step 1: Payload being sent:', updates);

      if (authUserErr) {
        console.warn('[PROFILE DEBUG] Warning getting auth user:', authUserErr.message);
      }

      // 2. Update Supabase Auth user metadata
      const { data: authUpdateData, error: authUpdateErr } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          business_name: updates.business_name,
          address: updates.address,
        },
      });

      if (authUpdateErr) {
        console.error('[PROFILE DEBUG] Supabase Auth updateUser error:', authUpdateErr);
      } else {
        console.log('[PROFILE DEBUG] Supabase Auth updateUser success response:', authUpdateData);
      }

      // 3. Prepare payload for profiles table
      const now = new Date().toISOString();
      const profilePayload: Record<string, any> = {
        updated_at: now,
      };
      if (updates.full_name !== undefined) profilePayload.full_name = updates.full_name;
      if (updates.phone !== undefined) profilePayload.phone = updates.phone;
      if (updates.avatar_url !== undefined) profilePayload.avatar_url = updates.avatar_url;

      let affectedRows = 0;
      let lastError: any = null;
      let updateData: any = null;

      // 4a. Attempt UPDATE targeting `user_id`
      console.log('[PROFILE DEBUG] Attempting UPDATE on profiles table WHERE user_id =', targetUserId);
      const resByUserId = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('user_id', targetUserId)
        .select();

      console.log('[PROFILE DEBUG] UPDATE by user_id response:', {
        data: resByUserId.data,
        error: resByUserId.error,
        rowsAffected: resByUserId.data?.length ?? 0,
      });

      if (resByUserId.data && resByUserId.data.length > 0) {
        affectedRows = resByUserId.data.length;
        updateData = resByUserId.data;
      } else {
        if (resByUserId.error) lastError = resByUserId.error;

        // 4b. Fallback UPDATE targeting `id`
        console.log('[PROFILE DEBUG] Attempting UPDATE on profiles table WHERE id =', targetUserId);
        const resById = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', targetUserId)
          .select();

        console.log('[PROFILE DEBUG] UPDATE by id response:', {
          data: resById.data,
          error: resById.error,
          rowsAffected: resById.data?.length ?? 0,
        });

        if (resById.data && resById.data.length > 0) {
          affectedRows = resById.data.length;
          updateData = resById.data;
        } else {
          if (resById.error) lastError = resById.error;

          // 4c. Fallback UPSERT if row does not exist yet
          console.log('[PROFILE DEBUG] Zero rows updated via UPDATE query. Attempting UPSERT...');
          const upsertPayload = {
            id: targetUserId,
            user_id: targetUserId,
            ...profilePayload,
          };
          const resUpsert = await supabase
            .from('profiles')
            .upsert(upsertPayload, { onConflict: 'id' })
            .select();

          console.log('[PROFILE DEBUG] UPSERT response:', {
            data: resUpsert.data,
            error: resUpsert.error,
            rowsAffected: resUpsert.data?.length ?? 0,
          });

          if (resUpsert.data && resUpsert.data.length > 0) {
            affectedRows = resUpsert.data.length;
            updateData = resUpsert.data;
          } else if (resUpsert.error) {
            lastError = resUpsert.error;
          }
        }
      }

      // 5. Synchronize business_settings table and local cache
      if (updates.business_name !== undefined || updates.address !== undefined || updates.phone !== undefined) {
        console.log('[PROFILE DEBUG] Syncing business settings for user_id =', targetUserId);
        await settingsService.updateBusinessSettings(targetUserId, {
          ...(updates.business_name !== undefined ? { businessName: updates.business_name || '' } : {}),
          ...(updates.address !== undefined ? { address: updates.address || '' } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone || '' } : {}),
        });
      }

      // 6. Verify by immediately re-reading profile from database
      const verifiedProfile = await this.getProfile(targetUserId);
      console.log('[PROFILE DEBUG] Step 5: Verified Profile re-read from Supabase:', verifiedProfile);

      // Check for zero updated rows or errors
      if (affectedRows === 0 && !authUpdateData?.user) {
        const errorMsg = lastError?.message || 'Zero rows updated in profiles database table and auth update failed.';
        console.error('[PROFILE DEBUG] FAILURE:', errorMsg);
        return {
          success: false,
          rowsUpdated: 0,
          errorMessage: errorMsg,
          verifiedProfile,
        };
      }

      console.log(`[PROFILE DEBUG] SUCCESS: ${affectedRows} row(s) updated in database.`);
      return {
        success: true,
        rowsUpdated: affectedRows > 0 ? affectedRows : 1, // 1 if updated via auth metadata
        verifiedProfile,
        data: updateData,
      };
    } catch (err: any) {
      console.error('[PROFILE DEBUG] Exception during updateUserProfile:', err);
      return {
        success: false,
        rowsUpdated: 0,
        errorMessage: err.message || 'Error updating profile',
      };
    }
  },

  formatAuthError(error: any): string {
    if (!error) return 'An unexpected error occurred.';
    const message = typeof error === 'string' ? error : error.message || '';

    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('User already registered') || message.includes('already in use') || message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('Password should be') || message.includes('password') && message.includes('least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('invalid') && message.includes('email')) {
      return 'Please provide a valid email address.';
    }
    if (message.includes('Failed to fetch') || message.includes('network') || message.includes('NetworkError')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    return message || 'Authentication failed. Please try again.';
  },
};
