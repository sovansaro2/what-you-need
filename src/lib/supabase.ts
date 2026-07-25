import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://dpwtuzsspcxiebctjqyv.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwd3R1enNzcGN4aWViY3RqcXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTIzMTcsImV4cCI6MjEwMDQ2ODMxN30.yy1Gs-FPRPv3f95N23xDVRJsr5YHvuHrbEDleH2n774';

/**
 * Ensures the Supabase URL is a clean root origin without trailing slashes or /rest/v1 paths.
 */
export const sanitizeSupabaseUrl = (url: string): string => {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -'/rest/v1'.length);
  }
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

export const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const supabaseKey = supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
