import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchOwnProfile, signOutUser } from '@/services/auth';
import type { Profile } from '@/types/auth';

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  profileError: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState(false);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    try {
      setProfile(await fetchOwnProfile(id));
      setProfileError(false);
    } catch {
      setProfile(null);
      setProfileError(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      void loadProfile(userId);
    } else {
      setProfile(null);
      setProfileError(false);
    }
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo(
    () => ({ user, profile, isLoading, profileError, refreshProfile, signOut }),
    [user, profile, isLoading, profileError, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
