export interface Notification {
  id: string;
  type: string; // e.g., 'session_reminder', 'cancellation', 'patient_management', 'clinical_record'
  title: string;
  message: string;
  read: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}