import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These are expected to be set in environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Log a warning instead of throwing to prevent app crash on load
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Missing Supabase configuration. Please check your environment variables. Using placeholder values to prevent crash.');
}

// Use placeholders if variables are missing to allow the app to boot
// This makes the app more resilient on Vercel/refresh when config is missing
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder-url.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  }
);
