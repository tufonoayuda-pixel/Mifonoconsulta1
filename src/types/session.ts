export interface Session {
  id: string;
  patientName: string; // For simplicity, using patient name directly for now
  room: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // in minutes
  type: "Evaluación" | "Intervención" | "Seguimiento" | "Alta";
  status: "Programada" | "Atendida" | "No Atendida";
  observationsAttended?: string; // Renamed from 'observations' for clarity when session is 'Atendida'
  continueSessions?: boolean; // For 'Atendida' sessions
  justificationNotAttended?: string; // New field for 'No Atendida' sessions
  isJustifiedNotAttended?: boolean; // New field for 'No Atendida' sessions
  // New fields for recurrence
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly"; // Example patterns
  recurrenceEndDate?: string; // YYYY-MM-DD
}