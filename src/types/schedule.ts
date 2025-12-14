export interface Schedule {
  id: string;
  room: string;
  day_of_week: number; // 0 for Sunday, 1 for Monday, etc.
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}