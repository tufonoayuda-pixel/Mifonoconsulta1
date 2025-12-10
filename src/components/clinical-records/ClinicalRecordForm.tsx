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
  EvaluationRecordData,
  InterventionPlanRecordData,
  SessionRecordData,
} from "@/types/clinical-record";
import { Patient } from "@/types/patient";
import { Session } from "@/types/session";
import { showSuccess, showError } from "@/utils/toast";

import FileUpload from "./FileUpload";
import EvaluationFields from "./EvaluationFields";
import InterventionPlanFields from "./InterventionPlanFields";
import SessionRecordFields from "./SessionRecordFields";
import PatientForm from "../patients/PatientForm"; // Import PatientForm

// Define Zod schemas for each record type's data
const evaluationDataSchema = z.object({
  schoolLevel: z.string().optional(),
  reasonForConsultation: z.string().optional(),
  medicalDiagnosis: z.string().optional(),
  anamnesisInfo: z.string().optional(),
  familyContext: z.string().optional(),
  previousTherapies: z.string().optional(),
  environmentConditions: z.string().optional(),
  hearingAidUse: z.string().optional(),
  appliedTests: z.string().optional(),
  clinicalObservationMethods: z.string().optional(),
  speechAnatomyStructures: z.string().optional(),
  acousticPerceptionDetection: z.string().optional(),
  acousticPerceptionDiscrimination: z.string().optional(),
  acousticPerceptionIdentification: z.string().optional(),
  acousticPerceptionRecognition: z.string().optional(),
  acousticPerceptionComprehension: z.string().optional(),
  linguisticSkillsLanguage: z.string().optional(),
  linguisticSkillsSemantics: z.string().optional(),
  linguisticSkillsLiteracy: z.string().optional(),
  linguisticSkillsPragmatics: z.string().optional(),
  comprehensiveLevel: z.string().optional(),
  expressiveLevel: z.string().optional(),
  acousticPerceptionSynthesis: z.string().optional(),
  fonoaudiologicalDiagnosis: z.string().optional(),
  therapeuticRecommendations: z.string().optional(),
});

const interventionPlanDataSchema = z.object({
  schooling: z.string().optional(),
  relevantClinicalInfo: z.string().optional(),
  mainDiagnosis: z.string().optional(),
  geersMoogCategory: z.enum(["Detección", "Discriminación", "Identificación", "Reconocimiento", "Comprensión"]).optional(),
  mainMethodology: z.enum(["Terapia Auditiva Verbal", "Enfoque Bilingüe Bicultural", "Comunicación Total"]).optional(),
  specificStrategies: z.string().optional(),
  interventionFocus: z.enum(["Directo", "Indirecto", "Mixto"]).optional(),
  modality: z.enum(["Individual", "Grupal", "Familiar"]).optional(),
  areasToWorkAuditorySkills: z.string().optional(),
  areasToWorkSemantics: z.string().optional(),
  areasToWorkInstructionFollowing: z.string().optional(),
  areasToWorkCommunicativeIntention: z.string().optional(),
  specificActivities: z.string().optional(),
  materialsAndResources: z.string().optional(),
  generalObjective: z.string().optional(),
  specificAndOperationalObjectives: z.string().optional(),
  estimatedPlanDurationSessions: z.coerce.number().int().positive().optional(),
  sessionFrequency: z.string().optional(),
  additionalObservations: z.string().optional(),
});

const sessionRecordDataSchema = z.object({
  sessionId: z.string().optional(),
  sessionObjectives: z.string().optional(),
  activitiesPerformed: z.string().optional(),
  observedAchievements: z.string().optional(),
  additionalClinicalObservations: z.string().optional(),
  patientResponse: z.string().optional(),
  futurePlanning: z.string().optional(),
});

// Main schema for the form, with a discriminated union for 'data'
const clinicalRecordFormSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, { message: "Paciente es obligatorio." }),
  recordType: z.enum(["Evaluación", "Plan de Intervención", "Registro de Sesión"], {
    message: "Tipo de registro es obligatorio.",
  }),
  recordDate: z.string().min(1, { message: "Fecha del registro es obligatoria." }),
  title: z.string().min(1, { message: "Título es obligatorio." }),
  attachments: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })).optional(),
  data: z.union([
    evaluationDataSchema,
    interventionPlanDataSchema,
    sessionRecordDataSchema,
  ]),
});

export type ClinicalRecordFormValues = z.infer<typeof clinicalRecordFormSchema>;

interface ClinicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: ClinicalRecord) => void;
  initialData?: ClinicalRecord | null;
  availablePatients: Patient[];
  availableSessions: Session[];
  onAddPatient: (patient: Patient) => void; // Callback to add a new patient
  existingRuts: string[]; // For PatientForm
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
}) => {
  const form = useForm<ClinicalRecordFormValues>({
    resolver: zodResolver(clinicalRecordFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          attachments: initialData.attachments || [],
        }
      : {
          patientId: "",
          recordType: "Evaluación",
          recordDate: format(new Date(), "yyyy-MM-dd"),
          title: "",
          attachments: [],
          data: {}, // Default empty data, will be filled by sub-forms
        },
  });

  const selectedPatientId = form.watch("patientId");
  const selectedRecordType = form.watch("recordType");
  const selectedRecordDate = form.watch("recordDate");

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
        attachments: initialData.attachments || [],
      });
    } else {
      form.reset({
        patientId: "",
        recordType: "Evaluación",
        recordDate: format(new Date(), "yyyy-MM-dd"),
        title: "",
        attachments: [],
        data: {},
      });
    }
  }, [initialData, form]);

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

  const handleSubmit = (values: ClinicalRecordFormValues) => {
    if (!selectedPatient) {
      showError("Debe seleccionar un paciente.");
      return;
    }

    const now = new Date().toISOString();
    const recordToSubmit: ClinicalRecord = {
      ...values,
      patientName: selectedPatient.name,
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
      data: values.data as any, // Type assertion due to discriminated union complexity
    };
    onSubmit(recordToSubmit);
    form.reset();
    onClose();
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initialData ? "Editar Registro Clínico" : "Nuevo Registro Clínico"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Registro</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {selectedRecordType === "Registro de Sesión" && (
                <FormField
                  control={form.control}
                  name="data.sessionId"
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

              <FormField
                control={form.control}
                name="recordDate"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{initialData ? "Actualizar" : "Guardar"}</Button>
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