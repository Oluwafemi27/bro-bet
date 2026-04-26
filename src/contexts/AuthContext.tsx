import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { full_name: string; phone: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create a minimal profile
const createMinimalProfile = (userId: string): Profile => ({
  id: userId,
  full_name: "",
  email: null,
  balance: 0,
  bonus_balance: 0,
  kyc_verified: false,
  referral_code: "",
  created_at: new Date().toISOString(),
  phone: null,
  updated_at: new Date().toISOString(),
});

// Fetch profile with timeout
const fetchProfileWithTimeout = async (userId: string, timeoutMs = 5000): Promise<Profile> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const promise = supabase.from("profiles").select("*").eq("id", userId);
    const { data, error: selectError } = await promise;

    if (selectError) throw selectError;

    if (data && data.length > 0) {
      return data[0];
    }

    // Create a default profile if it doesn't exist
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: "",
        email: null,
        balance: 0,
        bonus_balance: 0,
        kyc_verified: false,
        referral_code: Math.random().toString(36).substring(2, 11).toUpperCase(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProfile || createMinimalProfile(userId);
  } catch (error) {
    console.error("Error fetching/creating profile:", error);
    return createMinimalProfile(userId);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const pendingProfileFetchRef = useRef<Promise<void> | null>(null);

  const fetchProfile = async (userId: string) => {
    // Prevent multiple concurrent fetches
    if (pendingProfileFetchRef.current) {
      return pendingProfileFetchRef.current;
    }

    pendingProfileFetchRef.current = (async () => {
      try {
        const profile = await fetchProfileWithTimeout(userId, 5000);
        if (isMountedRef.current) {
          setProfile(profile);
        }
      } finally {
        pendingProfileFetchRef.current = null;
      }
    })();

    return pendingProfileFetchRef.current;
  };

  useEffect(() => {
    isMountedRef.current = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        // Set a timeout for initial session retrieval
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>(
          (resolve) => setTimeout(() => resolve({ data: { session: null } }), 3000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!isMountedRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMountedRef.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMountedRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    subscription = authSubscription;

    // Initialize auth
    initAuth();

    return () => {
      isMountedRef.current = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: { full_name: string; phone: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
