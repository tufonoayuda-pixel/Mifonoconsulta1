"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
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
import { GeersMoogCategory, MethodologyType, InterventionFocus, Modality } from "@/types/clinical-record";

interface InterventionPlanFieldsProps {
  patientNameDisplay?: string;
  planDateDisplay?: string;
  patientAgeDisplay?: number;
}

const InterventionPlanFields: React.FC<InterventionPlanFieldsProps> = ({
  patientNameDisplay,
  planDateDisplay,
  patientAgeDisplay,
}) => {
  const form = useFormContext<ClinicalRecordFormValues>();

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
      </div>
      <FormField
        control={form.control}
        name="data.schooling"
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
      <FormField
        control={form.control}
        name="data.relevantClinicalInfo"
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
        name="data.mainDiagnosis"
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
        name="data.geersMoogCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría de Percepción Acústica (Geers y Moog)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      <FormField
        control={form.control}
        name="data.mainMethodology"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metodología Principal</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        name="data.specificStrategies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estrategias Específicas</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe las estrategias específicas a utilizar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.interventionFocus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Foco de Intervención</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        name="data.modality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modalidad</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      <h3 className="text-lg font-semibold mt-8">IV. CONTENIDOS DE INTERVENCIÓN</h3>
      <FormField
        control={form.control}
        name="data.areasToWorkAuditorySkills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Habilidades Auditivas</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe las habilidades auditivas a trabajar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.areasToWorkSemantics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Semántica</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe los aspectos semánticos a trabajar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.areasToWorkInstructionFollowing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Seguimiento de Instrucciones</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe el trabajo en seguimiento de instrucciones..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.areasToWorkCommunicativeIntention"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intención Comunicativa</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe el trabajo en intención comunicativa..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.specificActivities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actividades Específicas</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalla las actividades específicas a realizar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data.materialsAndResources"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Materiales y Recursos</FormLabel>
            <FormControl>
              <Textarea placeholder="Lista de materiales y recursos necesarios..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">V. OBJETIVO GENERAL (OG)</h3>
      <FormField
        control={form.control}
        name="data.generalObjective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivo General del Plan</FormLabel>
            <FormControl>
              <Textarea placeholder="Define el objetivo general del plan de intervención..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VI. OBJETIVOS ESPECÍFICOS Y OPERACIONALES (O.E. y O.O.)</h3>
      <FormField
        control={form.control}
        name="data.specificAndOperationalObjectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivos Específicos y Operacionales</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalla los objetivos específicos y operacionales..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VII. OBSERVACIONES Y SEGUIMIENTO</h3>
      <FormField
        control={form.control}
        name="data.estimatedPlanDurationSessions"
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
        name="data.sessionFrequency"
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
      <FormField
        control={form.control}
        name="data.additionalObservations"
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