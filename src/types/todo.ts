export interface Todo {
  id: string;
  user_id?: string; // Optional, will be set by Supabase RLS
  task: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}