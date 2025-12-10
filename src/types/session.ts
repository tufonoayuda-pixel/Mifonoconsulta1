export interface Session {
  id: string;
  patientName: string; // For simplicity, using patient name directly for now
  room: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // in minutes
  type: "Evaluación" | "Intervención" | "Seguimiento" | "Alta";
  status: "Programada" | "Atendida" | "No Atendida";
  observations?: string;
}