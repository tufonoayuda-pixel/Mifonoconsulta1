"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table"; // Reusing generic DataTable
import { createSessionColumns } from "@/components/sessions/columns";
import SessionForm from "@/components/sessions/SessionForm";
import SessionStatusDialog from "@/components/sessions/SessionStatusDialog";
import SessionCalendar from "@/components/sessions/SessionCalendar";
import DailyAgenda from "@/components/sessions/DailyAgenda"; // Import the new DailyAgenda component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@/types/session";
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast";
import { format, parse, isBefore, addMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { toast } from "sonner"; // Import sonner toast
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQuery, useMutation and useQueryClient
import { es } from "date-fns/locale"; // Import es locale for date-fns

const Sessions = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToUpdateStatus, setSessionToUpdateStatus] = useState<Session | null>(null);
  const [statusType, setStatusType] = useState<"Atendida" | "No Atendida">("Atendida");
  const [currentView, setCurrentView] = useState<string>("table");
  const [selectedDayForAgenda, setSelectedDayForAgenda] = useState<Date>(new Date()); // New state for DailyAgenda

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
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sessions").select("*");
      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        patientName: availablePatients?.find(p => p.id === s.patient_id)?.name || "Desconocido", // Map patient_id to patientName
        room: s.room,
        date: s.date,
        time: s.time,
        duration: s.duration,
        type: s.type,
        status: s.status,
        observationsAttended: s.observations_attended,
        continueSessions: s.continue_sessions,
        justificationNotAttended: s.justification_not_attended,
        isJustifiedNotAttended: s.is_justified_not_attended,
        // Recurrence fields are not in DB yet, so keep them optional or default
        isRecurring: false,
        recurrencePattern: undefined,
        recurrenceEndDate: undefined,
      })) as Session[];
    },
    enabled: !!availablePatients, // Only run if patients data is available
  });

  const notifiedSessions = useRef(new Set<string>());
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio("/notification.mp3");
  }, []);

  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const createNotification = useCallback(async (type: string, title: string, message: string) => {
    const { error } = await supabase.from("notifications").insert({
      type,
      title,
      message,
      read: false,
      time: format(new Date(), "HH:mm", { locale: es }), // Add current time
    });
    if (error) {
      console.error("Error creating notification:", error);
    }
  }, []);

  useEffect(() => {
    if (!sessions) return; // Ensure sessions are loaded

    const interval = setInterval(() => {
      const now = new Date();
      sessions.forEach(session => {
        if (session.status === "Programada" && !notifiedSessions.current.has(session.id)) {
          const sessionDateTime = parse(`${session.date} ${session.time}`, "yyyy-MM-dd HH:mm", new Date());
          const tenMinutesBefore = addMinutes(sessionDateTime, -10);

          if (isBefore(tenMinutesBefore, now) && isBefore(now, sessionDateTime)) {
            toast.info(`Recordatorio: La sesión de ${session.patientName} en la sala ${session.room} comienza en menos de 10 minutos.`, {
              duration: 10000,
              action: {
                label: "Ver Sesiones",
                onClick: () => setCurrentView("table"),
              },
            });
            playNotificationSound();
            createNotification(
              "session_reminder",
              "Recordatorio de Sesión Próxima",
              `La sesión de ${session.patientName} en la sala ${session.room} a las ${session.time} comienza pronto.`
            );
            notifiedSessions.current.add(session.id);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessions, createNotification]);


  const addSessionMutation = async (newSession: Session) => {
    const patient = availablePatients?.find(p => p.name === newSession.patientName);
    if (!patient) {
      throw new Error("Paciente no encontrado.");
    }

    const sessionsToInsert: Omit<Session, 'patientName'>[] = [];
    if (newSession.isRecurring && newSession.recurrencePattern && newSession.recurrenceEndDate) {
      let currentDate = parse(newSession.date, "yyyy-MM-dd", new Date());
      const endDate = parse(newSession.recurrenceEndDate, "yyyy-MM-dd", new Date());

      while (currentDate <= endDate) {
        sessionsToInsert.push({
          ...newSession,
          patientId: patient.id, // Link to patient ID
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
      sessionsToInsert.push({ ...newSession, patientId: patient.id, status: "Programada" });
    }

    const { error } = await supabase.from("sessions").insert(sessionsToInsert.map(s => ({
      patient_id: s.patientId,
      room: s.room,
      date: s.date,
      time: s.time,
      duration: s.duration,
      type: s.type,
      status: s.status,
      observations_attended: s.observationsAttended,
      continue_sessions: s.continueSessions,
      justification_not_attended: s.justificationNotAttended,
      is_justified_not_attended: s.isJustifiedNotAttended,
    })));

    if (error) throw error;
    return sessionsToInsert.length > 1 ? `${sessionsToInsert.length} sesiones recurrentes programadas exitosamente.` : "Sesión programada exitosamente.";
  };

  const updateSessionMutation = async (updatedSession: Session) => {
    const patient = availablePatients?.find(p => p.name === updatedSession.patientName);
    if (!patient) {
      throw new Error("Paciente no encontrado.");
    }

    const { error } = await supabase.from("sessions").update({
      patient_id: patient.id,
      room: updatedSession.room,
      date: updatedSession.date,
      time: updatedSession.time,
      duration: updatedSession.duration,
      type: updatedSession.type,
      status: updatedSession.status,
      observations_attended: updatedSession.observationsAttended,
      continue_sessions: updatedSession.continueSessions,
      justification_not_attended: updatedSession.justificationNotAttended,
      is_justified_not_attended: updatedSession.isJustifiedNotAttended,
    }).eq("id", updatedSession.id);

    if (error) throw error;
    return "Sesión actualizada exitosamente.";
  };

  const deleteSessionMutation = async (id: string) => {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) throw error;
    return "Sesión eliminada exitosamente.";
  };

  const { mutate: addSession } = useMutation({
    mutationFn: addSessionMutation,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showSuccess(message);
    },
    onError: (err: Error) => showError("Error al programar sesión: " + err.message),
  });

  const { mutate: updateSession } = useMutation({
    mutationFn: updateSessionMutation,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showSuccess(message);
    },
    onError: (err: Error) => showError("Error al actualizar sesión: " + err.message),
  });

  const { mutate: deleteSession } = useMutation({
    mutationFn: deleteSessionMutation,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      showSuccess(message);
    },
    onError: (err: Error) => showError("Error al eliminar sesión: " + err.message),
  });


  const handleAddSession = (newSession: Session) => {
    addSession(newSession);
  };

  const handleEditSession = (updatedSession: Session) => {
    updateSession(updatedSession);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
  };

  const handleUpdateSessionStatus = (session: Session, values: { observationsAttended?: string; justificationNotAttended?: string; isJustifiedNotAttended?: boolean; continueSessions?: boolean }) => {
    const updatedSession: Session = {
      ...session,
      status: statusType,
      observationsAttended: values.observationsAttended,
      continueSessions: values.continueSessions,
      justificationNotAttended: values.justificationNotAttended,
      isJustifiedNotAttended: values.isJustifiedNotAttended,
    };
    updateSession(updatedSession);

    // Create a notification for the status change
    let notificationMessage = "";
    if (statusType === "Atendida") {
      notificationMessage = `La sesión del paciente ${session.patientName} el ${format(new Date(session.date), "PPP", { locale: es })} a las ${session.time} ha sido marcada como Atendida. Observaciones: ${values.observationsAttended || "N/A"}.`;
    } else {
      notificationMessage = `La sesión del paciente ${session.patientName} el ${format(new Date(session.date), "PPP", { locale: es })} a las ${session.time} ha sido marcada como No Atendida. Justificación: ${values.justificationNotAttended || "N/A"}. Justificada: ${values.isJustifiedNotAttended ? "Sí" : "No"}.`;
    }

    createNotification(
      "session_status_update",
      `Sesión de ${session.patientName} ${statusType}`,
      notificationMessage
    );
  };

  const openAddForm = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const openEditForm = (session: Session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const openMarkAttendedDialog = (session: Session) => {
    setSessionToUpdateStatus(session);
    setStatusType("Atendida");
    setIsStatusDialogOpen(true);
  };

  const openMarkNotAttendedDialog = (session: Session) => {
    setSessionToUpdateStatus(session);
    setStatusType("No Atendida");
    setIsStatusDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  const closeStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setSessionToUpdateStatus(null);
  };

  const columns = createSessionColumns({
    onEdit: openEditForm,
    onMarkAttended: openMarkAttendedDialog,
    onMarkNotAttended: openMarkNotAttendedDialog,
    onDelete: handleDeleteSession,
  });

  if (isLoadingPatients || isLoadingSessions) return <div className="p-4 text-center">Cargando datos para sesiones...</div>;
  if (isErrorPatients) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {errorPatients?.message}</div>;
  if (isErrorSessions) return <div className="p-4 text-center text-red-500">Error al cargar sesiones: {errorSessions?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Sesiones</h1>
        <div className="flex gap-2">
          <Button onClick={openAddForm}>Programar Sesión</Button>
        </div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Programa, visualiza y gestiona todas las sesiones con tus pacientes.
      </p>

      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="calendar">Vista de Calendario</TabsTrigger>
          <TabsTrigger value="daily-agenda">Agenda Diaria</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <DataTable
            columns={columns}
            data={sessions || []}
            searchPlaceholder="Buscar sesiones por paciente, sala o estado..."
            searchColumn="patientName"
          />
        </TabsContent>
        <TabsContent value="calendar">
          <SessionCalendar sessions={sessions || []} onSelectSession={openEditForm} />
        </TabsContent>
        <TabsContent value="daily-agenda">
          <DailyAgenda
            sessions={sessions || []}
            availablePatients={availablePatients || []}
            selectedDate={selectedDayForAgenda}
            onDateChange={setSelectedDayForAgenda}
            onSelectSession={openEditForm}
          />
        </TabsContent>
      </Tabs>

      <SessionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingSession ? handleEditSession : handleAddSession}
        initialData={editingSession}
        availablePatients={availablePatients || []}
      />

      <SessionStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={closeStatusDialog}
        onSubmit={handleUpdateSessionStatus}
        session={sessionToUpdateStatus}
        statusType={statusType}
      />
    </div>
  );
};

export default Sessions;