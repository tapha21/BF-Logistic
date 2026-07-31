import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

if (!supabaseConfigured) {
  console.error("VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définies (.env ou variables Vercel)");
}

export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder-key");
