"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse, addMinutes, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

import { supabase, db } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Patient } from "@/types/patient";
import { Session } from "@/types/session";

// Helper function to map frontend status to DB status
const mapFrontendStatusToDb = (status: Session["status"]): string => {
  switch (status) {
    case "Programada":
      return "scheduled";
    case "Atendida":
      return "completed";
    case "No Atendida":
      return "cancelled";
    default:
      return "scheduled";
  }
};

// Helper function to map DB status to frontend status
const mapDbStatusToFrontend = (dbStatus: string): Session["status"] => {
  switch (dbStatus) {
    case "scheduled":
      return "Programada";
    case "completed":
      return "Atendida";
    case "cancelled":
    case "canceled": // Also handle 'canceled' if it might come from DB
      return "No Atendida";
    case "in-progress":
    default:
      return "Programada";
  }
};

export const useSessionsData = () => {
  const queryClient = useQueryClient();

  // Fetch patients from Supabase
  const { data: availablePatients, isLoading: isLoadingPatients, isError: isErrorPatients, error: errorPatients } = useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data as Patient[];
    },
  });

  // Fetch sessions from Supabase
  const { data: sessions, isLoading: isLoadingSessions, isError: isErrorSessions, error: errorSessions } = useQuery<Session[], Error>({
    queryKey: ["sessions", availablePatients],
    queryFn: async () => {
      const { data, error } = await supabase.from("sessions").select("*");
      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        patientId: s.patient_id,
        patientName: availablePatients?.find(p => p.id === s.patient_id)?.name || "Desconocido",
        room: s.room,
        date: s.date,
        time: s.time,
        duration: s.duration,
        type: s.type,
        status: mapDbStatusToFrontend(s.status),
        observationsAttended: s.observations_attended,
        continueSessions: s.continue_sessions,
        justificationNotAttended: s.justification_not_attended,
        isJustifiedNotAttended: s.is_justified_not_attended,
        isRecurring: s.is_recurring || false, // Assuming these fields exist in DB or default
        recurrencePattern: s.recurrence_pattern || undefined,
        recurrenceEndDate: s.recurrence_end_date || undefined,
      })) as Session[];
    },
    enabled: !!availablePatients,
  });

  // Mutation for adding a session
  const addSessionMutation = useMutation<string, Error, Session>({
    mutationFn: async (newSession) => {
      console.log("Attempting to add new session(s):", newSession);
      const sessionsToInsert: Omit<Session, 'patientName'>[] = [];
      if (newSession.isRecurring && newSession.recurrencePattern && newSession.recurrenceEndDate) {
        let currentDate = parse(newSession.date, "yyyy-MM-dd", new Date());
        const endDate = parse(newSession.recurrenceEndDate, "yyyy-MM-dd", new Date());

        while (currentDate <= endDate) {
          sessionsToInsert.push({
            ...newSession,
            date: format(currentDate, "yyyy-MM-dd"),
            status: "Programada",
            isRecurring: true,
            recurrencePattern: newSession.recurrencePattern,
            recurrenceEndDate: newSession.recurrenceEndDate,
          });

          switch (newSession.recurrencePattern) {
            case "daily":
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case "weekly":
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case "monthly":
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
            case "yearly":
              currentDate.setFullYear(currentDate.getFullYear() + 1);
              break;
            default:
              break;
          }
        }
      } else {
        sessionsToInsert.push({ ...newSession, status: "Programada" });
      }

      const payload = sessionsToInsert.map(s => ({
        patient_id: s.patientId,
        room: s.room,
        date: s.date,
        time: s.time,
        duration: s.duration,
        type: s.type,
        status: mapFrontendStatusToDb(s.status),
        observations_attended: s.observationsAttended,
        continue_sessions: s.continueSessions,
        justification_not_attended: s.justificationNotAttended,
        is_justified_not_attended: s.isJustifiedNotAttended,
        is_recurring: s.isRecurring,
        recurrence_pattern: s.recurrencePattern,
        recurrence_end_date: s.recurrenceEndDate,
      }));

      console.log("Payload for Supabase insert:", payload);

      const { error } = await db.from("sessions").insert(payload);

      if (error) throw error;
      return sessionsToInsert.length > 1 ? `${sessionsToInsert.length} sesiones recurrentes programadas exitosamente (o en cola para sincronizar).` : "Sesión programada exitosamente (o en cola para sincronizar).";
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Invalidate dashboard stats as well
      showSuccess(message);
    },
    onError: (err: Error) => {
      console.error("Error in addSessionMutation:", err); // Log the full error
      showError("Error al programar sesión: " + err.message);
    },
  });

  // Mutation for updating a session
  const updateSessionMutation = useMutation<string, Error, Session>({
    mutationFn: async (updatedSession) => {
      console.log("Attempting to update session:", updatedSession);
      const payload = {
        patient_id: updatedSession.patientId,
        room: updatedSession.room,
        date: updatedSession.date,
        time: updatedSession.time,
        duration: updatedSession.duration,
        type: updatedSession.type,
        status: mapFrontendStatusToDb(updatedSession.status),
        observations_attended: updatedSession.observationsAttended,
        continue_sessions: updatedSession.continueSessions,
        justification_not_attended: updatedSession.justificationNotAttended,
        is_justified_not_attended: updatedSession.isJustifiedNotAttended,
        is_recurring: updatedSession.isRecurring,
        recurrence_pattern: updatedSession.recurrencePattern,
        recurrence_end_date: updatedSession.recurrenceEndDate,
      };
      console.log("Payload for Supabase update:", payload);

      const { error } = await db.from("sessions").update(payload).match({ id: updatedSession.id });

      if (error) throw error;
      return "Sesión actualizada exitosamente (o en cola para sincronizar).";
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Invalidate dashboard stats as well
      showSuccess(message);
    },
    onError: (err: Error) => {
      console.error("Error in updateSessionMutation:", err); // Log the full error
      showError("Error al actualizar sesión: " + err.message);
    },
  });

  // Mutation for deleting a session
  const deleteSessionMutation = useMutation<string, Error, string>({
    mutationFn: async (id) => {
      console.log("Attempting to delete session with ID:", id);
      const { error } = await db.from("sessions").delete().match({ id: id });
      if (error) throw error;
      return "Sesión eliminada exitosamente (o en cola para sincronizar).";
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Invalidate dashboard stats as well
      showSuccess(message);
    },
    onError: (err: Error) => {
      console.error("Error in deleteSessionMutation:", err); // Log the full error
      showError("Error al eliminar sesión: " + err.message);
    },
  });

  return {
    sessions: sessions || [],
    availablePatients: availablePatients || [],
    isLoading: isLoadingPatients || isLoadingSessions,
    isError: isErrorPatients || isErrorSessions,
    error: errorPatients || errorSessions,
    addSession: addSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isAddingSession: addSessionMutation.isPending,
    isUpdatingSession: updateSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
  };
};