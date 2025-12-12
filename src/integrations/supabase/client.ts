import { createClient } from '@supabase/supabase-js';
import { offlineSupabase } from './offline-client'; // Import the offline client

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
}

// Export the original online client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the offline-capable client as the default for application use
export const db = offlineSupabase;