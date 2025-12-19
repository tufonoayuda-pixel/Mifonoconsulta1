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
import { Textarea } from "@/components/ui/textarea";
import { ClinicalRecordFormValues } from "./ClinicalRecordForm"; // Import the type

interface SessionRecordFieldsProps {
  form: UseFormReturn<ClinicalRecordFormValues>; // Accept form as a prop
}

const SessionRecordFields: React.FC<SessionRecordFieldsProps> = ({ form }) => {
  // Removed useFormContext()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Objetivos de la Sesión</h3>
      <FormField
        control={form.control}
        name="session_objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivos planteados para esta sesión</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe los objetivos específicos de la sesión..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">Desarrollo de la Sesión</h3>
      <FormField
        control={form.control}
        name="activities_performed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actividades Realizadas</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalla las actividades y ejercicios realizados durante la sesión..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="clinical_observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logros Observados (Progreso)</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe los avances y logros observados en el paciente..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="observations_suggestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones Clínicas Adicionales</FormLabel>
            <FormControl>
              <Textarea placeholder="Añade cualquier observación clínica relevante..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="response_patient"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Respuesta del Paciente</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe la actitud y respuesta del paciente durante la sesión..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">Planificación Futura</h3>
      <FormField
        control={form.control}
        name="next_session"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Próxima Sesión / Tareas para el hogar</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalles para la próxima sesión o tareas recomendadas para el hogar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SessionRecordFields;