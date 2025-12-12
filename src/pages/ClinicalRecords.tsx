"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, FileText, Download } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { DataTable } from "@/components/clinical-records/data-table";
import { createClinicalRecordColumns } from "@/components/clinical-records/columns";
import ClinicalRecordForm from "@/components/clinical-records/ClinicalRecordForm";
import { ClinicalRecord, ClinicalRecordType } from "@/types/clinical-record";
import { Patient } from "@/types/patient";
import { Session } from "@/types/session";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client"; // Import both
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from "date-fns";

interface Attachment {
  name: string;
  url: string;
  type: string;
  path?: string; // Added path for Supabase Storage management
}

const ClinicalRecords = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClinicalRecord | null>(null);
  const [initialRecordType, setInitialRecordType] = useState<ClinicalRecordType>("Evaluación");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  const [attachmentsToView, setAttachmentsToView] = useState<Attachment[]>([]);

  // Fetch patients from Supabase (always try online for reads, or implement read-caching)
  const { data: patients, isLoading: isLoadingPatients, isError: isErrorPatients, error: errorPatients } = useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*"); // Use online client for reads
      if (error) throw error;
      return data as Patient[];
    },
  });

  // Fetch sessions from Supabase (always try online for reads, or implement read-caching)
  const { data: sessions, isLoading: isLoadingSessions, isError: isErrorSessions, error: errorSessions } = useQuery<Session[], Error>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sessions").select("*"); // Use online client for reads
      if (error) throw error;
      return data as Session[];
    },
  });

  // Fetch clinical records from Supabase (always try online for reads, or implement read-caching)
  const { data: clinicalRecords, isLoading: isLoadingRecords, isError: isErrorRecords, error: errorRecords } = useQuery<ClinicalRecord[], Error>({
    queryKey: ["clinical_records", patients], // Invalidate if patients change to update patientName
    queryFn: async () => {
      const { data, error } = await supabase.from("clinical_records").select("*"); // Use online client for reads
      if (error) throw error;

      // Map DB data to frontend ClinicalRecord interface, including patientName and attachments
      const recordsWithDetails: ClinicalRecord[] = await Promise.all((data as any[]).map(async (record) => {
        const patient = patients?.find(p => p.id === record.patient_id);
        const { data: attachmentsData, error: attachmentsError } = await supabase // Use online client for attachments
          .from("attachments")
          .select("*")
          .eq("clinical_record_id", record.id);

        if (attachmentsError) console.error("Error fetching attachments for record", record.id, attachmentsError);

        return {
          id: record.id,
          patientId: record.patient_id,
          patientName: patient?.name || "Desconocido",
          type: record.type,
          date: record.date,
          title: record.title,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
          attachments: attachmentsData?.map(att => ({
            name: att.file_name,
            url: att.file_url,
            type: att.file_type,
            path: att.file_path,
          })) || [],
          // Map all other flattened fields
          school_level: record.school_level,
          reason_for_consultation: record.reason_for_consultation,
          medical_diagnosis: record.medical_diagnosis,
          anamnesis_info: record.anamnesis_info,
          family_context: record.family_context,
          previous_therapies: record.previous_therapies,
          evaluation_conditions: record.evaluation_conditions,
          hearing_aids_use: record.hearing_aids_use,
          applied_tests: record.applied_tests,
          clinical_observation_methods: record.clinical_observation_methods,
          speech_anatomical_structures: record.speech_anatomical_structures,
          acoustic_perception_detection: record.acoustic_perception_detection,
          acoustic_perception_discrimination: record.acoustic_perception_discrimination,
          acoustic_perception_identification: record.acoustic_perception_identification,
          acoustic_perception_recognition: record.acoustic_perception_recognition,
          acoustic_perception_comprehension: record.acoustic_perception_comprehension,
          linguistic_skills_language: record.linguistic_skills_language,
          linguistic_skills_semantics: record.linguistic_skills_semantics,
          linguistic_skills_literacy: record.linguistic_skills_literacy,
          linguistic_skills_pragmatics: record.linguistic_skills_pragmatics,
          synthesis_comprehensive_level: record.synthesis_comprehensive_level,
          synthesis_expressive_level: record.synthesis_expressive_level,
          synthesis_acoustic_perception: record.synthesis_acoustic_perception,
          phonodiagnosis: record.phonodiagnosis,
          observations_suggestions: record.observations_suggestions,
          geers_moog_category: record.geers_moog_category,
          auditory_verbal_therapy_methodology: record.auditory_verbal_therapy_methodology,
          techniques_strategies: record.techniques_strategies,
          intervention_focus: record.intervention_focus,
          modality: record.modality,
          auditory_skills: record.auditory_skills,
          semantics_intervention: record.semantics_intervention,
          instruction_following: record.instruction_following,
          communicative_intent: record.communicative_intent,
          activities_specific: record.activities_specific,
          materials_resources: record.materials_resources,
          general_objective: record.general_objective,
          specific_operational_objectives: record.specific_operational_objectives,
          plan_duration_estimated: record.plan_duration_estimated,
          session_frequency: record.session_frequency,
          session_id: record.session_id,
          session_objectives: record.session_objectives,
          activities_performed: record.activities_performed,
          clinical_observations: record.clinical_observations,
          response_patient: record.response_patient,
          next_session: record.next_session,
        };
      }));
      return recordsWithDetails;
    },
    enabled: !!patients, // Only run if patients data is available
  });

  // Mutation for adding a clinical record
  const addClinicalRecordMutation = useMutation<ClinicalRecord, Error, ClinicalRecord>({
    mutationFn: async (newRecord) => {
      // The onSubmit in ClinicalRecordForm handles the actual Supabase insert/update
      // This mutation is primarily for invalidating queries and showing toasts
      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical_records"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Update dashboard stats
    },
    onError: (err) => {
      showError("Error al añadir registro clínico: " + err.message);
    },
  });

  // Mutation for updating a clinical record
  const updateClinicalRecordMutation = useMutation<ClinicalRecord, Error, ClinicalRecord>({
    mutationFn: async (updatedRecord) => {
      // The onSubmit in ClinicalRecordForm handles the actual Supabase insert/update
      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical_records"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Update dashboard stats
    },
    onError: (err) => {
      showError("Error al actualizar registro clínico: " + err.message);
    },
  });

  // Mutation for deleting a clinical record
  const deleteClinicalRecordMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      // First, fetch attachments to delete from storage
      const { data: attachments, error: fetchAttError } = await supabase // Use online client for storage operations
        .from("attachments")
        .select("file_path")
        .eq("clinical_record_id", id);

      if (fetchAttError) throw fetchAttError;

      // Delete files from storage
      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(att => att.file_path).filter(Boolean) as string[];
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.onlineClient.storage.from("clinical-record-attachments").remove(filePaths); // Use online client for storage
          if (storageError) console.error("Error deleting files from storage:", storageError);
        }
      }

      // Then delete attachments records from DB
      const { error: deleteAttError } = await db.from("attachments").delete().eq("clinical_record_id", id); // Use offline client for attachments table
      if (deleteAttError) throw deleteAttError;

      // Finally, delete the clinical record
      const { error } = await db.from("clinical_records").delete().eq("id", id); // Use offline client for clinical records table
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical_records"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Update dashboard stats
      showSuccess("Registro clínico eliminado exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar registro clínico: " + err.message);
    },
  });

  const handleFormSubmit = (record: ClinicalRecord) => {
    if (editingRecord) {
      updateClinicalRecordMutation.mutate(record);
    } else {
      addClinicalRecordMutation.mutate(record);
    }
    closeForm();
  };

  const openAddForm = (type: ClinicalRecordType) => {
    setEditingRecord(null);
    setInitialRecordType(type); // Set the initial type
    setIsFormOpen(true);
  };

  const openEditForm = (record: ClinicalRecord) => {
    setEditingRecord(record);
    setInitialRecordType(record.type); // Use record.type
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleAddPatient = () => {
    queryClient.invalidateQueries({ queryKey: ["patients"] }); // Re-fetch patients after adding a new one
  };

  const handleViewAttachments = (attachments: Attachment[]) => {
    setAttachmentsToView(attachments);
    setIsAttachmentsDialogOpen(true);
  };

  const filteredRecords = useMemo(() => {
    let filtered = clinicalRecords || [];

    if (currentTab !== "all") {
      filtered = filtered.filter((record) => record.type === currentTab);
    }

    if (globalFilter) {
      const lowerCaseFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(lowerCaseFilter) ||
          record.patientName.toLowerCase().includes(lowerCaseFilter) ||
          record.type.toLowerCase().includes(lowerCaseFilter)
      );
    }
    return filtered;
  }, [clinicalRecords, currentTab, globalFilter]);

  const columns = createClinicalRecordColumns({
    onEdit: openEditForm,
    onDelete: (id) => deleteClinicalRecordMutation.mutate(id),
    onViewAttachments: handleViewAttachments,
  });

  const existingRuts = patients?.map(p => p.rut) || [];

  if (isLoadingPatients || isLoadingSessions || isLoadingRecords) return <div className="p-4 text-center">Cargando datos para registros clínicos...</div>;
  if (isErrorPatients) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {errorPatients?.message}</div>;
  if (isErrorSessions) return <div className="p-4 text-center text-red-500">Error al cargar sesiones: {errorSessions?.message}</div>;
  if (isErrorRecords) return <div className="p-4 text-center text-red-500">Error al cargar registros clínicos: {errorRecords?.message}</div>;

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
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        availablePatients={patients || []}
        availableSessions={sessions || []}
        onAddPatient={handleAddPatient}
        existingRuts={existingRuts}
        isSubmitting={addClinicalRecordMutation.isPending || updateClinicalRecordMutation.isPending}
        initialRecordType={initialRecordType}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      // Optional: Implement deletion of individual attachments from this dialog
                      showError("La eliminación de adjuntos individuales no está implementada aquí.");
                    }}
                    className="h-6 w-6 text-gray-500 hover:text-red-500"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Descargar archivo</span>
                  </Button>
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