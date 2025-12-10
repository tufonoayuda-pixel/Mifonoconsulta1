"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table"; // Reusing generic DataTable
import { createSessionColumns } from "@/components/sessions/columns";
import SessionForm from "@/components/sessions/SessionForm";
import SessionStatusDialog from "@/components/sessions/SessionStatusDialog";
import { Session } from "@/types/session";
import { Patient } from "@/types/patient"; // Import Patient type
import { showSuccess, showError } from "@/utils/toast";

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToUpdateStatus, setSessionToUpdateStatus] = useState<Session | null>(null);
  const [statusType, setStatusType] = useState<"Atendida" | "No Atendida">("Atendida");

  // Mock patient data for session form, replace with actual patient list later
  const [availablePatients] = useState<Patient[]>([
    { id: "p1", rut: "11.111.111-1", name: "Juan Pérez" },
    { id: "p2", rut: "22.222.222-2", name: "María García" },
    { id: "p3", rut: "33.333.333-3", name: "Carlos López" },
  ]);

  const handleAddSession = (newSession: Session) => {
    setSessions((prevSessions) => {
      const sessionWithId = { ...newSession, id: uuidv4(), status: "Programada" };
      showSuccess("Sesión programada exitosamente.");
      return [...prevSessions, sessionWithId];
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
          <Button onClick={() => alert("Funcionalidad de calendario pendiente.")} variant="outline">
            Ver Calendario
          </Button>
          <Button onClick={openAddForm}>Programar Sesión</Button>
        </div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Programa, visualiza y gestiona todas las sesiones con tus pacientes.
      </p>

      <DataTable
        columns={columns}
        data={sessions}
        searchPlaceholder="Buscar sesiones por paciente, sala o estado..."
        searchColumn="patientName" // Can be extended for multi-column search
      />

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