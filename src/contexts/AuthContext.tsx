import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
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
  referral_code: "",
  created_at: new Date().toISOString(),
  phone: null,
  updated_at: new Date().toISOString(),
  is_admin: false,
  is_staff: false,
});

// Fetch profile with timeout and error resilience
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

// Check admin role with resilience against unauthenticated calls
const checkAdminRole = async (userId: string, profileIsAdmin: boolean | null): Promise<boolean> => {
  if (profileIsAdmin) return true;
  try {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return !!data;
  } catch (error) {
    console.warn("Error checking admin role, falling back to profile flag:", error);
    return !!profileIsAdmin;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const pendingProfileFetchRef = useRef<Promise<void> | null>(null);
  const initializedRef = useRef(false);

  const fetchProfileAndRole = async (userId: string) => {
    // Prevent multiple concurrent fetches
    if (pendingProfileFetchRef.current) {
      return pendingProfileFetchRef.current;
    }

    pendingProfileFetchRef.current = (async () => {
      try {
        console.log("Fetching profile and role for:", userId);
        const profileData = await fetchProfileWithTimeout(userId, 5000);
        const isUserAdmin = await checkAdminRole(userId, profileData?.is_admin);

        if (isMountedRef.current) {
          setProfile(profileData);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error("Error fetching profile/role:", error);
      } finally {
        pendingProfileFetchRef.current = null;
      }
    })();

    return pendingProfileFetchRef.current;
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Safety timeout: set loading to false after 3s max to prevent infinite loading
    const safetyTimeoutId = setTimeout(() => {
      if (isMountedRef.current && loading) {
        console.warn("Auth initialization timed out, forcing loading to false");
        setLoading(false);
        initializedRef.current = true;
      }
    }, 3000);

    let authSubscription: { unsubscribe: () => void } | null = null;

    // Step 1: Get the initial session first (from localStorage persistence)
    // This is the primary initialization path - we rely on this, not the onAuthStateChange INITIAL_SESSION
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMountedRef.current) return;

      console.log("Auth: got initial session", initialSession?.user?.id);

      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        // Fetch profile asynchronously, but set loading=false after profile is done
        fetchProfileAndRole(initialSession.user.id).finally(() => {
          if (isMountedRef.current && !initializedRef.current) {
            setLoading(false);
            initializedRef.current = true;
          }
        });
      } else {
        if (isMountedRef.current && !initializedRef.current) {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          initializedRef.current = true;
        }
      }
    }).catch((error) => {
      console.error("Auth: getSession error", error);
      if (isMountedRef.current && !initializedRef.current) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        initializedRef.current = true;
      }
    });

    // Step 2: Set up auth state listener for subsequent changes (login/logout/token refresh)
    // We do NOT rely on INITIAL_SESSION from this listener to prevent double-fetching
    try {
      const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!isMountedRef.current) return;

        // Ignore the INITIAL_SESSION event since we already handled it via getSession()
        if (event === 'INITIAL_SESSION') return;

        console.log("Auth state change:", event, currentSession?.user?.id);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          fetchProfileAndRole(currentSession.user.id).then(() => {
            if (isMountedRef.current && !initializedRef.current) {
              setLoading(false);
              initializedRef.current = true;
            }
          });
        } else {
          setProfile(null);
          setIsAdmin(false);
          if (isMountedRef.current && !initializedRef.current) {
            setLoading(false);
            initializedRef.current = true;
          }
        }
      });
      authSubscription = data.subscription;
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      if (isMountedRef.current && !initializedRef.current) {
        setLoading(false);
        initializedRef.current = true;
      }
    }

    return () => {
      isMountedRef.current = false;
      clearTimeout(safetyTimeoutId);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Set up real-time profile subscription
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time profile subscription for:", user.id);
    const profileSubscription = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload.new);
          if (isMountedRef.current) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user]);

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
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfileAndRole(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
