"use client";

import React, { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { DataTable } from "@/components/clinical-records/data-table";
import { createClinicalRecordColumns } from "@/components/clinical-records/columns";
import ClinicalRecordForm from "@/components/clinical-records/ClinicalRecordForm";
import { ClinicalRecord, ClinicalRecordType } from "@/types/clinical-record";
import { Patient } from "@/types/patient";
import { Session } from "@/types/session";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

const ClinicalRecords = () => {
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<ClinicalRecord[]>([]); // Still using local state for records for now
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClinicalRecord | null>(null);
  const [initialRecordType, setInitialRecordType] = useState<ClinicalRecordType>("Evaluación");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  const [attachmentsToView, setAttachmentsToView] = useState<Attachment[]>([]);

  // Fetch patients from Supabase
  const { data: patients, isLoading: isLoadingPatients, isError: isErrorPatients, error: errorPatients } = useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data as Patient[];
    },
  });

  // Mock data for sessions (replace with actual data fetching if needed)
  const [sessions] = useState<Session[]>([
    { id: "s1", patientName: "Juan Pérez", room: "UAPORRINO", date: "2023-10-26", time: "10:00", duration: 40, type: "Intervención", status: "Programada" },
    { id: "s2", patientName: "María García", room: "RBC", date: "2023-10-27", time: "11:00", duration: 60, type: "Evaluación", status: "Atendida" },
  ]);

  const handleAddRecord = (newRecord: ClinicalRecord) => {
    setRecords((prevRecords) => {
      const now = new Date().toISOString();
      const recordWithId = { ...newRecord, id: uuidv4(), createdAt: now, updatedAt: now };
      showSuccess("Registro clínico añadido exitosamente.");
      return [...prevRecords, recordWithId];
    });
  };

  const handleEditRecord = (updatedRecord: ClinicalRecord) => {
    setRecords((prevRecords) =>
      prevRecords.map((r) => (r.id === updatedRecord.id ? { ...updatedRecord, updatedAt: new Date().toISOString() } : r))
    );
    showSuccess("Registro clínico actualizado exitosamente.");
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));
    showSuccess("Registro clínico eliminado exitosamente.");
    // TODO: Implement actual file deletion from storage
  };

  const openAddForm = (type: ClinicalRecordType) => {
    setEditingRecord(null);
    setInitialRecordType(type);
    setIsFormOpen(true);
  };

  const openEditForm = (record: ClinicalRecord) => {
    setEditingRecord(record);
    setInitialRecordType(record.recordType);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleAddPatient = (newPatient: Patient) => {
    // This will trigger a re-fetch of patients in the useQuery hook
    queryClient.invalidateQueries({ queryKey: ["patients"] });
  };

  const handleViewAttachments = (attachments: Attachment[]) => {
    setAttachmentsToView(attachments);
    setIsAttachmentsDialogOpen(true);
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (currentTab !== "all") {
      filtered = filtered.filter((record) => record.recordType === currentTab);
    }

    if (globalFilter) {
      const lowerCaseFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(lowerCaseFilter) ||
          record.patientName.toLowerCase().includes(lowerCaseFilter) ||
          record.recordType.toLowerCase().includes(lowerCaseFilter)
      );
    }
    return filtered;
  }, [records, currentTab, globalFilter]);

  const columns = createClinicalRecordColumns({
    onEdit: openEditForm,
    onDelete: handleDeleteRecord,
    onViewAttachments: handleViewAttachments,
  });

  const existingRuts = patients?.map(p => p.rut) || [];

  if (isLoadingPatients) return <div className="p-4 text-center">Cargando pacientes para registros clínicos...</div>;
  if (isErrorPatients) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {errorPatients?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Registros Clínicos</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Registro
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Selecciona Tipo de Registro</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openAddForm("Evaluación")}>
              Nueva Evaluación
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openAddForm("Plan de Intervención")}>
              Nuevo Plan de Intervención
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openAddForm("Registro de Sesión")}>
              Nuevo Registro de Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Crea y gestiona evaluaciones, planes de intervención y registros de sesión para tus pacientes.
      </p>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="Evaluación">Evaluaciones</TabsTrigger>
          <TabsTrigger value="Plan de Intervención">Planes de Intervención</TabsTrigger>
          <TabsTrigger value="Registro de Sesión">Registros de Sesión</TabsTrigger>
        </TabsList>
        <TabsContent value={currentTab}>
          <DataTable
            columns={columns}
            data={filteredRecords}
            searchPlaceholder="Buscar registros por título, paciente o tipo..."
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>
      </Tabs>

      <ClinicalRecordForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingRecord ? handleEditRecord : handleAddRecord}
        initialData={editingRecord}
        availablePatients={patients || []} // Pass fetched patients
        availableSessions={sessions}
        onAddPatient={handleAddPatient}
        existingRuts={existingRuts}
      />

      {/* Dialog for viewing attachments */}
      <Dialog open={isAttachmentsDialogOpen} onOpenChange={setIsAttachmentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archivos Adjuntos</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {attachmentsToView.length > 0 ? (
              attachmentsToView.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay archivos adjuntos.</p>
            )}
          </div>
          <Button onClick={() => setIsAttachmentsDialogOpen(false)}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalRecords;