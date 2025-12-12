"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  ClinicalRecord,
  ClinicalRecordType,
} from "@/types/clinical-record";
import { Patient } from "@/types/patient";
import { Session } from "@/types/session";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client"; // Import both supabase (online) and db (offline) clients

import FileUpload from "./FileUpload";
import EvaluationFields from "./EvaluationFields";
import InterventionPlanFields from "./InterventionPlanFields";
import SessionRecordFields from "./SessionRecordFields";
import PatientForm from "../patients/PatientForm"; // Import PatientForm

// Define Zod schema for all possible fields in a flattened structure
const clinicalRecordFormSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, { message: "Paciente es obligatorio." }),
  type: z.enum(["Evaluación", "Plan de Intervención", "Registro de Sesión"], { // Renamed from recordType
    message: "Tipo de registro es obligatorio.",
  }),
  date: z.string().min(1, { message: "Fecha del registro es obligatoria." }), // Renamed from recordDate
  title: z.string().min(1, { message: "Título es obligatorio." }),
  attachments: z.array(z.object({ name: z.string(), url: z.string(), type: z.string(), path: z.string().optional() })).optional(),

  // Evaluation Record Specific Fields
  school_level: z.string().optional(),
  reason_for_consultation: z.string().optional(),
  medical_diagnosis: z.string().optional(),
  anamnesis_info: z.string().optional(),
  family_context: z.string().optional(),
  previous_therapies: z.string().optional(),
  evaluation_conditions: z.string().optional(),
  hearing_aids_use: z.string().optional(),
  applied_tests: z.string().optional(),
  clinical_observation_methods: z.string().optional(),
  speech_anatomical_structures: z.string().optional(),
  acoustic_perception_detection: z.string().optional(),
  acoustic_perception_discrimination: z.string().optional(),
  acoustic_perception_identification: z.string().optional(),
  acoustic_perception_recognition: z.string().optional(),
  acoustic_perception_comprehension: z.string().optional(),
  linguistic_skills_language: z.string().optional(),
  linguistic_skills_semantics: z.string().optional(),
  linguistic_skills_literacy: z.string().optional(),
  linguistic_skills_pragmatics: z.string().optional(),
  synthesis_comprehensive_level: z.string().optional(),
  synthesis_expressive_level: z.string().optional(),
  synthesis_acoustic_perception: z.string().optional(),
  phonodiagnosis: z.string().optional(),
  observations_suggestions: z.string().optional(),

  // Intervention Plan Specific Fields
  geers_moog_category: z.enum(["Detección", "Discriminación", "Identificación", "Reconocimiento", "Comprensión"]).optional(),
  auditory_verbal_therapy_methodology: z.enum(["Terapia Auditiva Verbal", "Enfoque Bilingüe Bicultural", "Comunicación Total"]).optional(),
  techniques_strategies: z.string().optional(),
  intervention_focus: z.enum(["Directo", "Indirecto", "Mixto"]).optional(),
  modality: z.enum(["Individual", "Grupal", "Familiar"]).optional(),
  auditory_skills: z.string().optional(),
  semantics_intervention: z.string().optional(), // Renamed to avoid conflict
  instruction_following: z.string().optional(),
  communicative_intent: z.string().optional(),
  activities_specific: z.string().optional(),
  materials_resources: z.string().optional(),
  general_objective: z.string().optional(),
  specific_operational_objectives: z.string().optional(),
  plan_duration_estimated: z.coerce.number().int().min(0).optional(),
  session_frequency: z.string().optional(),

  // Session Record Specific Fields
  session_id: z.string().optional(),
  session_objectives: z.string().optional(),
  activities_performed: z.string().optional(),
  clinical_observations: z.string().optional(),
  response_patient: z.string().optional(),
  next_session: z.string().optional(),
});

export type ClinicalRecordFormValues = z.infer<typeof clinicalRecordFormSchema>;

interface ClinicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: ClinicalRecord) => void; // This will now be handled by react-query mutations
  initialData?: ClinicalRecord | null;
  availablePatients: Patient[];
  availableSessions: Session[];
  onAddPatient: (patient: Patient) => void; // Callback to add a new patient
  existingRuts: string[]; // For PatientForm
  isSubmitting: boolean; // New prop for submission state
  initialRecordType: ClinicalRecordType; // Added prop to set initial type for new records
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availablePatients,
  availableSessions,
  onAddPatient,
  existingRuts,
  isSubmitting,
  initialRecordType, // Destructure the new prop
}) => {
  const form = useForm<ClinicalRecordFormValues>({
    resolver: zodResolver(clinicalRecordFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: initialData.date || format(new Date(), "yyyy-MM-dd"),
          attachments: initialData.attachments || [],
          // Ensure all fields are present, even if undefined
          school_level: initialData.school_level || "",
          reason_for_consultation: initialData.reason_for_consultation || "",
          medical_diagnosis: initialData.medical_diagnosis || "",
          anamnesis_info: initialData.anamnesis_info || "",
          family_context: initialData.family_context || "",
          previous_therapies: initialData.previous_therapies || "",
          evaluation_conditions: initialData.evaluation_conditions || "",
          hearing_aids_use: initialData.hearing_aids_use || "",
          applied_tests: initialData.applied_tests || "",
          clinical_observation_methods: initialData.clinical_observation_methods || "",
          speech_anatomical_structures: initialData.speech_anatomical_structures || "",
          acoustic_perception_detection: initialData.acoustic_perception_detection || "",
          acoustic_perception_discrimination: initialData.acoustic_perception_discrimination || "",
          acoustic_perception_identification: initialData.acoustic_perception_identification || "",
          acoustic_perception_recognition: initialData.acoustic_perception_recognition || "",
          acoustic_perception_comprehension: initialData.acoustic_perception_comprehension || "",
          linguistic_skills_language: initialData.linguistic_skills_language || "",
          linguistic_skills_semantics: initialData.linguistic_skills_semantics || "",
          linguistic_skills_literacy: initialData.linguistic_skills_literacy || "",
          linguistic_skills_pragmatics: initialData.linguistic_skills_pragmatics || "",
          synthesis_comprehensive_level: initialData.synthesis_comprehensive_level || "",
          synthesis_expressive_level: initialData.synthesis_expressive_level || "",
          synthesis_acoustic_perception: initialData.synthesis_acoustic_perception || "",
          phonodiagnosis: initialData.phonodiagnosis || "",
          observations_suggestions: initialData.observations_suggestions || "",
          geers_moog_category: initialData.geers_moog_category || undefined,
          auditory_verbal_therapy_methodology: initialData.auditory_verbal_therapy_methodology || undefined,
          techniques_strategies: initialData.techniques_strategies || "",
          intervention_focus: initialData.intervention_focus || undefined,
          modality: initialData.modality || undefined,
          auditory_skills: initialData.auditory_skills || "",
          semantics_intervention: initialData.semantics_intervention || "",
          instruction_following: initialData.instruction_following || "",
          communicative_intent: initialData.communicative_intent || "",
          activities_specific: initialData.activities_specific || "",
          materials_resources: initialData.materials_resources || "",
          general_objective: initialData.general_objective || "",
          specific_operational_objectives: initialData.specific_operational_objectives || "",
          plan_duration_estimated: initialData.plan_duration_estimated || undefined,
          session_frequency: initialData.session_frequency || "",
          session_id: initialData.session_id || "",
          session_objectives: initialData.session_objectives || "",
          activities_performed: initialData.activities_performed || "",
          clinical_observations: initialData.clinical_observations || "",
          response_patient: initialData.response_patient || "",
          next_session: initialData.next_session || "",
        }
      : {
          patientId: "",
          type: initialRecordType, // Use initialRecordType for new records
          date: format(new Date(), "yyyy-MM-dd"),
          title: "",
          attachments: [],
          // Initialize all optional fields to empty string or undefined
          school_level: "", reason_for_consultation: "", medical_diagnosis: "", anamnesis_info: "",
          family_context: "", previous_therapies: "", evaluation_conditions: "", hearing_aids_use: "",
          applied_tests: "", clinical_observation_methods: "", speech_anatomical_structures: "",
          acoustic_perception_detection: "", acoustic_perception_discrimination: "",
          acoustic_perception_identification: "", acoustic_perception_recognition: "",
          acoustic_perception_comprehension: "", linguistic_skills_language: "",
          linguistic_skills_semantics: "", linguistic_skills_literacy: "",
          linguistic_skills_pragmatics: "", synthesis_comprehensive_level: "",
          synthesis_expressive_level: "", synthesis_acoustic_perception: "",
          phonodiagnosis: "", observations_suggestions: "", geers_moog_category: undefined,
          auditory_verbal_therapy_methodology: undefined, techniques_strategies: "",
          intervention_focus: undefined, modality: undefined, auditory_skills: "",
          semantics_intervention: "", instruction_following: "", communicative_intent: "",
          activities_specific: "", materials_resources: "", general_objective: "",
          specific_operational_objectives: "", plan_duration_estimated: undefined,
          session_frequency: "", session_id: "", session_objectives: "",
          activities_performed: "", clinical_observations: "", response_patient: "",
          next_session: "",
        },
  });

  const selectedPatientId = form.watch("patientId");
  const selectedRecordType = form.watch("type"); // Renamed from recordType
  const selectedRecordDate = form.watch("date"); // Renamed from recordDate
  const currentAttachments = form.watch("attachments");

  const selectedPatient = availablePatients.find((p) => p.id === selectedPatientId);
  const filteredSessions = availableSessions.filter(
    (s) => s.patientName === selectedPatient?.name
  );

  // State for PatientForm dialog
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: initialData.date || format(new Date(), "yyyy-MM-dd"),
        attachments: initialData.attachments || [],
        // Ensure all fields are present, even if undefined
        school_level: initialData.school_level || "",
        reason_for_consultation: initialData.reason_for_consultation || "",
        medical_diagnosis: initialData.medical_diagnosis || "",
        anamnesis_info: initialData.anamnesis_info || "",
        family_context: initialData.family_context || "",
        previous_therapies: initialData.previous_therapies || "",
        evaluation_conditions: initialData.evaluation_conditions || "",
        hearing_aids_use: initialData.hearing_aids_use || "",
        applied_tests: initialData.applied_tests || "",
        clinical_observation_methods: initialData.clinical_observation_methods || "",
        speech_anatomical_structures: initialData.speech_anatomical_structures || "",
        acoustic_perception_detection: initialData.acoustic_perception_detection || "",
        acoustic_perception_discrimination: initialData.acoustic_perception_discrimination || "",
        acoustic_perception_identification: initialData.acoustic_perception_identification || "",
        acoustic_perception_recognition: initialData.acoustic_perception_recognition || "",
        acoustic_perception_comprehension: initialData.acoustic_perception_comprehension || "",
        linguistic_skills_language: initialData.linguistic_skills_language || "",
        linguistic_skills_semantics: initialData.linguistic_skills_semantics || "",
        linguistic_skills_literacy: initialData.linguistic_skills_literacy || "",
        linguistic_skills_pragmatics: initialData.linguistic_skills_pragmatics || "",
        synthesis_comprehensive_level: initialData.synthesis_comprehensive_level || "",
        synthesis_expressive_level: initialData.synthesis_expressive_level || "",
        synthesis_acoustic_perception: initialData.synthesis_acoustic_perception || "",
        phonodiagnosis: initialData.phonodiagnosis || "",
        observations_suggestions: initialData.observations_suggestions || "",
        geers_moog_category: initialData.geers_moog_category || undefined,
        auditory_verbal_therapy_methodology: initialData.auditory_verbal_therapy_methodology || undefined,
        techniques_strategies: initialData.techniques_strategies || "",
        intervention_focus: initialData.intervention_focus || undefined,
        modality: initialData.modality || undefined,
        auditory_skills: initialData.auditory_skills || "",
        semantics_intervention: initialData.semantics_intervention || "",
        instruction_following: initialData.instruction_following || "",
        communicative_intent: initialData.communicative_intent || "",
        activities_specific: initialData.activities_specific || "",
        materials_resources: initialData.materials_resources || "",
        general_objective: initialData.general_objective || "",
        specific_operational_objectives: initialData.specific_operational_objectives || "",
        plan_duration_estimated: initialData.plan_duration_estimated || undefined,
        session_frequency: initialData.session_frequency || "",
        session_id: initialData.session_id || "",
        session_objectives: initialData.session_objectives || "",
        activities_performed: initialData.activities_performed || "",
        clinical_observations: initialData.clinical_observations || "",
        response_patient: initialData.response_patient || "",
        next_session: initialData.next_session || "",
      });
    } else {
      // When creating a new record, set the type based on initialRecordType prop
      form.reset({
        patientId: "",
        type: initialRecordType, // Use initialRecordType here
        date: format(new Date(), "yyyy-MM-dd"),
        title: "",
        attachments: [],
        // Initialize all optional fields to empty string or undefined
        school_level: "", reason_for_consultation: "", medical_diagnosis: "", anamnesis_info: "",
        family_context: "", previous_therapies: "", evaluation_conditions: "", hearing_aids_use: "",
        applied_tests: "", clinical_observation_methods: "", speech_anatomical_structures: "",
        acoustic_perception_detection: "", acoustic_perception_discrimination: "",
        acoustic_perception_identification: "", acoustic_perception_recognition: "",
        acoustic_perception_comprehension: "", linguistic_skills_language: "",
        linguistic_skills_semantics: "", linguistic_skills_literacy: "",
        linguistic_skills_pragmatics: "", synthesis_comprehensive_level: "",
        synthesis_expressive_level: "", synthesis_acoustic_perception: "",
        phonodiagnosis: "", observations_suggestions: "", geers_moog_category: undefined,
        auditory_verbal_therapy_methodology: undefined, techniques_strategies: "",
        intervention_focus: undefined, modality: undefined, auditory_skills: "",
        semantics_intervention: "", instruction_following: "", communicative_intent: "",
        activities_specific: "", materials_resources: "", general_objective: "",
        specific_operational_objectives: "", plan_duration_estimated: undefined,
        session_frequency: "", session_id: "", session_objectives: "",
        activities_performed: "", clinical_observations: "", response_patient: "",
        next_session: "",
      });
    }
  }, [initialData, form, initialRecordType]); // Add initialRecordType to dependency array

  // Auto-generate title
  useEffect(() => {
    if (!initialData && selectedPatient && selectedRecordType) {
      let defaultTitle = "";
      switch (selectedRecordType) {
        case "Evaluación":
          defaultTitle = `Informe de Evaluación - ${selectedPatient.name}`;
          break;
        case "Plan de Intervención":
          defaultTitle = `Plan de Intervención - ${selectedPatient.name}`;
          break;
        case "Registro de Sesión":
          defaultTitle = `Registro de Sesión - ${selectedPatient.name}`;
          break;
      }
      form.setValue("title", defaultTitle);
    }
  }, [selectedPatient, selectedRecordType, initialData, form]);

  const handleSubmit = async (values: ClinicalRecordFormValues) => {
    if (!selectedPatient) {
      showError("Debe seleccionar un paciente.");
      return;
    }

    const now = new Date().toISOString();
    const recordToSubmit: Partial<ClinicalRecord> = {
      ...values,
      patientName: selectedPatient.name, // This is for display, not DB storage
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };

    // Clean up empty strings to null for DB insertion
    for (const key in recordToSubmit) {
      if (recordToSubmit[key as keyof ClinicalRecord] === "") {
        recordToSubmit[key as keyof ClinicalRecord] = null as any;
      }
    }

    // Separate attachments for processing
    const filesToUpload = currentAttachments?.filter(file => file.url.startsWith("blob:")) || [];
    const existingAttachments = currentAttachments?.filter(file => !file.url.startsWith("blob:")) || [];

    try {
      let recordId = values.id;
      if (initialData) {
        // Update existing record
        const { error } = await db.from("clinical_records").update(recordToSubmit).eq("id", initialData.id); // Use offline client
        if (error) throw error;
        showSuccess("Registro clínico actualizado exitosamente (o en cola para sincronizar).");
      } else {
        // Insert new record
        const { data, error } = await db.from("clinical_records").insert(recordToSubmit).select("id").single(); // Use offline client
        if (error) throw error;
        recordId = data.id;
        showSuccess("Registro clínico añadido exitosamente (o en cola para sincronizar).");
      }

      // Handle attachments
      if (recordId) {
        // Delete old attachments not present in currentAttachments
        const oldAttachments = initialData?.attachments || [];
        const attachmentsToDelete = oldAttachments.filter(
          oldAtt => !existingAttachments.some(newAtt => newAtt.path === oldAtt.path)
        );

        for (const att of attachmentsToDelete) {
          if (att.path) {
            // Storage operations must use the online client directly
            await supabase.onlineClient.storage.from("clinical-record-attachments").remove([att.path]);
            await db.from("attachments").delete().eq("file_url", att.url); // Use offline client for attachments table
          }
        }

        // Upload new files and insert into attachments table
        for (const file of filesToUpload) {
          const fileExtension = file.name.split(".").pop();
          const filePath = `${recordId}/${crypto.randomUUID()}.${fileExtension}`;
          // Storage operations must use the online client directly
          const { data: uploadData, error: uploadError } = await supabase.onlineClient.storage
            .from("clinical-record-attachments")
            .upload(filePath, await fetch(file.url).then(res => res.blob()), {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.onlineClient.storage
            .from("clinical-record-attachments")
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            const { error: insertAttachmentError } = await db.from("attachments").insert({ // Use offline client for attachments table
              clinical_record_id: recordId,
              file_name: file.name,
              file_type: file.type,
              file_url: publicUrlData.publicUrl,
              file_path: filePath, // Store path for deletion
            });
            if (insertAttachmentError) throw insertAttachmentError;
          }
        }
      }

      onSubmit(recordToSubmit as ClinicalRecord); // Trigger parent's onSuccess
      form.reset();
      onClose();
    } catch (error: any) {
      showError("Error al guardar el registro clínico: " + error.message);
      console.error("Error saving clinical record:", error);
    }
  };

  const handleAddPatientFromForm = (newPatient: Patient) => {
    onAddPatient(newPatient); // Add to the main patient list
    form.setValue("patientId", newPatient.id); // Select the newly added patient
    setIsPatientFormOpen(false);
    showSuccess("Nuevo paciente añadido y seleccionado.");
  };

  const renderConditionalFields = () => {
    switch (selectedRecordType) {
      case "Evaluación":
        return (
          <EvaluationFields
            patientRut={selectedPatient?.rut}
            patientAge={selectedPatient?.age}
          />
        );
      case "Plan de Intervención":
        return (
          <InterventionPlanFields
            patientNameDisplay={selectedPatient?.name}
            planDateDisplay={selectedRecordDate ? format(new Date(selectedRecordDate), "PPP", { locale: es }) : undefined}
            patientAgeDisplay={selectedPatient?.age}
          />
        );
      case "Registro de Sesión":
        return <SessionRecordFields />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initialData ? "Editar Registro Clínico" : "Nuevo Registro Clínico"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type" // Renamed from recordType
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Registro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}> {/* Use value={field.value} */}
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de registro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Evaluación">Evaluación</SelectItem>
                          <SelectItem value="Plan de Intervención">Plan de Intervención</SelectItem>
                          <SelectItem value="Registro de Sesión">Registro de Sesión</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Paciente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availablePatients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name} (RUT: {patient.rut})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPatientFormOpen(true)}
                    className="mb-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Añadir nuevo paciente</span>
                  </Button>
                </div>
              </div>

              {selectedRecordType === "Registro de Sesión" && (
                <FormField
                  control={form.control}
                  name="session_id" // Renamed from data.sessionId
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sesión Asociada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sesión" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => (
                              <SelectItem key={session.id} value={session.id}>
                                {format(new Date(session.date), "PPP", { locale: es })} - {session.time} ({session.room})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-sessions" disabled>
                              No hay sesiones para este paciente
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date" // Renamed from recordDate
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha del Registro</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Registro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Primera Evaluación Fonoaudiológica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {renderConditionalFields()}

              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Archivos Adjuntos</FormLabel>
                    <FormControl>
                      <FileUpload
                        onFilesChange={field.onChange}
                        initialFiles={field.value}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : (initialData ? "Actualizar" : "Guardar")}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* PatientForm dialog for adding new patients on the fly */}
      <PatientForm
        isOpen={isPatientFormOpen}
        onClose={() => setIsPatientFormOpen(false)}
        onSubmit={handleAddPatientFromForm}
        existingRuts={existingRuts}
      />
    </>
  );
};

export default ClinicalRecordForm;