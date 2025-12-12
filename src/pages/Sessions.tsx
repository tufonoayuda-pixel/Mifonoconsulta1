"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table";
import { createSessionColumns } from "@/components/sessions/columns";
import SessionForm from "@/components/sessions/SessionForm";
import SessionStatusDialog from "@/components/sessions/SessionStatusDialog";
import SessionCalendar from "@/components/sessions/SessionCalendar";
import DailyAgenda from "@/components/sessions/DailyAgenda";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@/types/session";
import { showError } from "@/utils/toast";
import { format } from "date-fns";

import { useSessionsData } from "@/hooks/useSessionsData"; // Import the new hook
import { useSessionNotifications } from "@/hooks/useSessionNotifications"; // Import the new hook

const Sessions = () => {
  const {
    sessions,
    availablePatients,
    isLoading,
    isError,
    error,
    addSession,
    updateSession,
    deleteSession,
  } = useSessionsData();

  useSessionNotifications(sessions); // Use the new notification hook

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToUpdateStatus, setSessionToUpdateStatus] = useState<Session | null>(null);
  const [statusType, setStatusType] = useState<"Atendida" | "No Atendida">("Atendida");
  const [currentView, setCurrentView] = useState<string>("table");
  const [selectedDayForAgenda, setSelectedDayForAgenda] = useState<Date>(new Date());

  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);

  const handleAddSession = (newSession: Session) => {
    addSession(newSession);
  };

  const handleEditSession = (updatedSession: Session) => {
    updateSession(updatedSession);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
  };

  const openAddForm = (date?: string, time?: string) => {
    setEditingSession(null);
    setPrefillDate(date);
    setPrefillTime(time);
    setIsFormOpen(true);
  };

  const openEditForm = (session: Session) => {
    setEditingSession(session);
    setPrefillDate(undefined);
    setPrefillTime(undefined);
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
    setPrefillDate(undefined);
    setPrefillTime(undefined);
  };

  const closeStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setSessionToUpdateStatus(null);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: 'select' | 'click' | 'doubleClick' }) => {
    const date = format(slotInfo.start, "yyyy-MM-dd");
    const time = format(slotInfo.start, "HH:mm");
    openAddForm(date, time);
  };

  const handleUpdateSessionStatus = async (session: Session, values: any) => {
    if (!session.id) {
      showError("ID de sesión no encontrado para actualizar.");
      return;
    }

    const updatedFields: Partial<Session> = {
      status: statusType,
      observationsAttended: values.observationsAttended,
      continueSessions: values.continueSessions,
      justificationNotAttended: values.justificationNotAttended,
      isJustifiedNotAttended: values.isJustifiedNotAttended,
    };

    try {
      updateSession({ ...session, ...updatedFields });
      closeStatusDialog();
    } catch (error: any) {
      showError("Error al actualizar el estado de la sesión: " + error.message);
      console.error("Error updating session status:", error);
    }
  };

  const columns = createSessionColumns({
    onEdit: openEditForm,
    onMarkAttended: openMarkAttendedDialog,
    onMarkNotAttended: openMarkNotAttendedDialog,
    onDelete: handleDeleteSession,
  });

  if (isLoading) return <div className="p-4 text-center">Cargando datos para sesiones...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar sesiones: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Sesiones</h1>
        <div className="flex gap-2">
          <Button onClick={() => openAddForm()}>Programar Sesión</Button>
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
          <SessionCalendar
            sessions={sessions || []}
            onSelectSession={openEditForm}
            onSelectSlot={handleSelectSlot}
          />
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
        initialData={editingSession ? {
          ...editingSession,
          patientId: availablePatients?.find(p => p.name === editingSession.patientName)?.id || "",
        } : (prefillDate ? {
          id: uuidv4(),
          patientId: "",
          patientName: "",
          room: "UAPORRINO",
          date: prefillDate,
          time: prefillTime || "09:00",
          duration: 40,
          type: "Intervención",
          status: "Programada",
        } as Session : null)}
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