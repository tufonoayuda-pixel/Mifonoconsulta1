"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table"; // Reusing generic DataTable
import { createSessionColumns } from "@/components/sessions/columns";
import SessionForm from "@/components/sessions/SessionForm";
import SessionStatusDialog from "@/components/sessions/SessionStatusDialog";
import SessionCalendar from "@/components/sessions/SessionCalendar"; // New import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // New import
import { Session } from "@/types/session";
import { Patient } from "@/types/patient"; // Import Patient type
import { showSuccess, showError } from "@/utils/toast";
import { format, parse } from "date-fns";

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToUpdateStatus, setSessionToUpdateStatus] = useState<Session | null>(null);
  const [statusType, setStatusType] = useState<"Atendida" | "No Atendida">("Atendida");
  const [currentView, setCurrentView] = useState<string>("table"); // New state for view

  // Mock patient data for session form, replace with actual patient list later
  const [availablePatients] = useState<Patient[]>([
    { id: "p1", rut: "11.111.111-1", name: "Juan Pérez" },
    { id: "p2", rut: "22.222.222-2", name: "María García" },
    { id: "p3", rut: "33.333.333-3", name: "Carlos López" },
  ]);

  const handleAddSession = (newSession: Session) => {
    setSessions((prevSessions) => {
      // For recurring sessions, generate multiple instances.
      // This is a simplified example; a more robust solution would handle complex recurrence rules.
      const sessionsToAdd: Session[] = [];
      if (newSession.isRecurring && newSession.recurrencePattern && newSession.recurrenceEndDate) {
        let currentDate = parse(newSession.date, "yyyy-MM-dd", new Date());
        const endDate = parse(newSession.recurrenceEndDate, "yyyy-MM-dd", new Date());

        while (currentDate <= endDate) {
          sessionsToAdd.push({
            ...newSession,
            id: uuidv4(),
            date: format(currentDate, "yyyy-MM-dd"),
            status: "Programada",
            isRecurring: true, // Mark generated sessions as recurring instances
            recurrencePattern: newSession.recurrencePattern,
            recurrenceEndDate: newSession.recurrenceEndDate,
          });

          // Increment date based on recurrence pattern
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
        showSuccess(`${sessionsToAdd.length} sesiones recurrentes programadas exitosamente.`);
      } else {
        sessionsToAdd.push({ ...newSession, id: uuidv4(), status: "Programada" });
        showSuccess("Sesión programada exitosamente.");
      }
      return [...prevSessions, ...sessionsToAdd];
    });
  };

  const handleEditSession = (updatedSession: Session) => {
    setSessions((prevSessions) =>
      prevSessions.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    showSuccess("Sesión actualizada exitosamente.");
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prevSessions) => prevSessions.filter((s) => s.id !== id));
    showSuccess("Sesión eliminada exitosamente.");
  };

  const handleUpdateSessionStatus = (session: Session, values: { observations?: string; justification?: string; continueSessions?: boolean }) => {
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === session.id
          ? {
              ...s,
              status: statusType,
              observations: values.observations || values.justification || s.observations,
            }
          : s
      )
    );
    showSuccess(`Sesión marcada como ${statusType}.`);
    // Here you might add logic based on continueSessions for "Atendida" status
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="calendar">Vista de Calendario</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <DataTable
            columns={columns}
            data={sessions}
            searchPlaceholder="Buscar sesiones por paciente, sala o estado..."
            searchColumn="patientName"
          />
        </TabsContent>
        <TabsContent value="calendar">
          <SessionCalendar sessions={sessions} onSelectSession={openEditForm} />
        </TabsContent>
      </Tabs>

      <SessionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingSession ? handleEditSession : handleAddSession}
        initialData={editingSession}
        availablePatients={availablePatients}
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