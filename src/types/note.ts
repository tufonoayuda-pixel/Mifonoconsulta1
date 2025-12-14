export interface Note {
  id: string;
  user_id?: string; // Optional, will be set by Supabase RLS
  title: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}