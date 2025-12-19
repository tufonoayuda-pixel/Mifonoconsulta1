export interface Todo {
  id: string;
  user_id?: string; // Optional, will be set by Supabase RLS
  task: string;
  is_completed: boolean;
  due_date?: string; // New: YYYY-MM-DD format
  created_at?: string;
  updated_at?: string;
}