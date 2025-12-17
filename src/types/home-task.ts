export interface HomeTask {
  id: string;
  user_id: string;
  patient_id: string;
  patientName?: string; // For display purposes, not stored in DB directly
  title: string;
  description?: string;
  due_date?: string; // YYYY-MM-DD format
  status: "assigned" | "completed";
  image_url?: string; // New: URL of the reference image
  image_path?: string; // New: Path in Supabase Storage for the image
  created_at?: string;
  updated_at?: string;
}