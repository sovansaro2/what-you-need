import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { UserProfile, SignUpData, SignInData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string, currentMetadata?: any) => {
    const userProfile = await authService.getProfile(userId);
    if (userProfile) {
      const merged: UserProfile = {
        ...userProfile,
        full_name: userProfile.full_name || currentMetadata?.full_name || null,
        phone: userProfile.phone || currentMetadata?.phone || null,
        avatar_url: userProfile.avatar_url !== undefined ? userProfile.avatar_url : (currentMetadata?.avatar_url || null),
      };
      setProfile(merged);
    } else {
      const created = await authService.ensureProfileExists(userId, {
        full_name: currentMetadata?.full_name,
        phone: currentMetadata?.phone,
      });
      setProfile(created);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id, initialSession.user.user_metadata);
          }
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    await authService.signUp(data);
  };

  const signIn = async (data: SignInData) => {
    await authService.signIn(data);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (password: string) => {
    await authService.updatePassword(password);
  };

  const refreshProfile = async () => {
    try {
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        await fetchProfile(updatedUser.id, updatedUser.user_metadata);
      } else if (user) {
        await fetchProfile(user.id, user.user_metadata);
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = SessionProvider;
