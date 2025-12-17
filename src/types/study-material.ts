export interface StudyMaterial {
  id: string;
  user_id?: string; // Optional, will be set by Supabase RLS
  name: string;
  description?: string;
  category: string;
  external_url?: string;
  file_url?: string; // URL from Supabase Storage (now optional, for existing entries)
  file_path?: string; // Path in Supabase Storage for deletion (now optional, for existing entries)
  created_at?: string;
  updated_at?: string;
}