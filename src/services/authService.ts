import { supabase } from '@/lib/supabase';
import { SignUpData, SignInData, UserProfile } from '@/types/auth';

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
