import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Wir ziehen die Keys dynamisch aus den Environment Variables (.env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Sicherheitsprüfung für die lokale Entwicklung
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("FATAL ERROR: Supabase Keys fehlen in den Environment Variables! Prüfe deine .env Datei.");
}

export const supabase = createClient<Database>(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});