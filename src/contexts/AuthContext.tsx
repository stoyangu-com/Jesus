import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { authHeaders } from '../lib/api';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'founder' | 'owner';
  store_id: number | null;
};

export type Store = {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  whatsapp: string;
  logo_url: string | null;
  design_json: Record<string, unknown>;
  user_id: string;
  total_visitors: number;
  total_wa_clicks: number;
  is_active: boolean;
  created_at?: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  store: Store | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  store: null,
  loading: true,
  refreshProfile: async () => undefined,
  signOut: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (activeSession: Session | null) => {
    if (!activeSession) {
      setProfile(null);
      setStore(null);
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setStore(data.store);
      } else {
        setProfile(null);
        setStore(null);
      }
    } catch {
      setProfile(null);
      setStore(null);
    }
  };

  const refreshProfile = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    await loadProfile(s);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      await loadProfile(s);
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        await loadProfile(s);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setStore(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      store,
      loading,
      refreshProfile,
      signOut,
    }),
    [user, session, profile, store, loading]
  );

  // silence unused import warning in some tooling
  void authHeaders;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
