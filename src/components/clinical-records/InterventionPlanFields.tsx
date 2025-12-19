"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form"; // Import UseFormReturn
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicalRecordFormValues } from "./ClinicalRecordForm"; // Import the type
// No need to import GeersMoogCategory, MethodologyType, InterventionFocus, Modality if not directly used here for types
// import { GeersMoogCategory, MethodologyType, InterventionFocus, Modality } from "@/types/clinical-record";

interface InterventionPlanFieldsProps {
  form: UseFormReturn<ClinicalRecordFormValues>; // Accept form as a prop
  patientNameDisplay?: string;
  planDateDisplay?: string;
  patientAgeDisplay?: number;
}

const InterventionPlanFields: React.FC<InterventionPlanFieldsProps> = ({
  form, // Destructure form prop
  patientNameDisplay,
  planDateDisplay,
  patientAgeDisplay,
}) => {
  // Removed useFormContext()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">I. IDENTIFICACIÓN DEL USUARIO</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Paciente</FormLabel>
          <FormControl>
            <Input value={patientNameDisplay || "N/A"} disabled />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Fecha del Plan</FormLabel>
          <FormControl>
            <Input value={planDateDisplay || "N/A"} disabled />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Edad del Paciente</FormLabel>
          <FormControl>
            <Input value={patientAgeDisplay !== undefined ? patientAgeDisplay.toString() : "N/A"} disabled />
          </FormControl>
        </FormItem>
        <FormField
          control={form.control}
          name="school_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escolaridad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 3° Básico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="anamnesis_info"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Información Clínica Relevante</FormLabel>
            <FormControl>
              <Textarea placeholder="Añade información clínica relevante para el plan..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">II. HIPÓTESIS DE DIAGNÓSTICO FONOAUDIOLÓGICO</h3>
      <FormField
        control={form.control}
        name="medical_diagnosis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Diagnóstico Principal</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe el diagnóstico fonoaudiológico principal..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="geers_moog_category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría de Percepción Acústica (Geers y Moog)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {["Detección", "Discriminación", "Identificación", "Reconocimiento", "Comprensión"].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">III. METODOLOGÍA A UTILIZAR</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="auditory_verbal_therapy_methodology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metodología Principal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una metodología" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Terapia Auditiva Verbal", "Enfoque Bilingüe Bicultural", "Comunicación Total"].map((methodology) => (
                    <SelectItem key={methodology} value={methodology}>
                      {methodology}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="intervention_focus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foco de Intervención</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un foco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Directo", "Indirecto", "Mixto"].map((focus) => (
                    <SelectItem key={focus} value={focus}>
                      {focus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="modality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una modalidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Individual", "Grupal", "Familiar"].map((modality) => (
                    <SelectItem key={modality} value={modality}>
                      {modality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="techniques_strategies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estrategias Específicas</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Realce acústico, Acercamiento auditivo, Condicionamiento auditivo..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">IV. CONTENIDOS DE INTERVENCIÓN</h3>
      <FormField
        control={form.control}
        name="auditory_skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Habilidades Auditivas</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe las habilidades auditivas específicas a desarrollar (ej. Detección, Discriminación, Identificación, Reconocimiento, Comprensión)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="semantics_intervention"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Semántica</FormLabel>
            <FormControl>
              <Textarea placeholder="Detallar los aspectos semánticos a abordar (ej. Vocabulario, Categorización, Conceptos)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="instruction_following"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Seguimiento de Instrucciones</FormLabel>
            <FormControl>
              <Textarea placeholder="Especificar el trabajo en la capacidad de seguir instrucciones (ej. Instrucciones simples, complejas, de múltiples pasos)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="communicative_intent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intención Comunicativa</FormLabel>
            <FormControl>
              <Textarea placeholder="Describir cómo se fomentará la intención comunicativa (ej. Pedir, comentar, saludar, responder)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="activities_specific"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actividades Específicas</FormLabel>
            <FormControl>
              <Textarea placeholder="Descripción detallada de las actividades planificadas para las sesiones..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="materials_resources"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Materiales y Recursos</FormLabel>
            <FormControl>
              <Textarea placeholder="Lista de materiales didácticos, juguetes, software o recursos necesarios para la intervención..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">V. OBJETIVO GENERAL (OG)</h3>
      <FormField
        control={form.control}
        name="general_objective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivo General del Plan</FormLabel>
            <FormControl>
              <Textarea placeholder="Enunciar el objetivo global que se busca alcanzar con la intervención (ej. Desarrollar la percepción auditiva y el lenguaje oral en el paciente...)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VI. OBJETIVOS ESPECÍFICOS Y OPERACIONALES (O.E. y O.O.)</h3>
      <FormField
        control={form.control}
        name="specific_operational_objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivos Específicos y Operacionales</FormLabel>
            <FormControl>
              <Textarea placeholder="Describir los objetivos específicos y operacionales, incluyendo criterios de logro y temporalidad..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VII. OBSERVACIONES Y SEGUIMIENTO</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="plan_duration_estimated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración Estimada del Plan (sesiones)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="session_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frecuencia de Sesiones</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 1 vez por semana" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="observations_suggestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones Adicionales</FormLabel>
            <FormControl>
              <Textarea placeholder="Añade cualquier observación relevante para el seguimiento..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default InterventionPlanFields;