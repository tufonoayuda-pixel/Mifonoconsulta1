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
import { ClinicalRecordFormValues } from "./ClinicalRecordForm"; // Import the type

interface EvaluationFieldsProps {
  form: UseFormReturn<ClinicalRecordFormValues>; // Accept form as a prop
  patientRut?: string;
  patientAge?: number;
  room?: string; // Nuevo: Aceptar la sala como prop
}

const EvaluationFields: React.FC<EvaluationFieldsProps> = ({ form, patientRut, patientAge, room }) => {
  // Removed useFormContext()

  return (
    <div className="space-y-6">
      {room && (
        <h2 className="text-xl font-bold mb-4">Evaluación para Sala: {room}</h2>
      )}
      <h3 className="text-lg font-semibold">I. ANTECEDENTES DE IDENTIFICACIÓN</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>RUT del Paciente</FormLabel>
          <FormControl>
            <Input value={patientRut || "N/A"} disabled />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Edad del Paciente</FormLabel>
          <FormControl>
            <Input value={patientAge !== undefined ? patientAge.toString() : "N/A"} disabled />
          </FormControl>
        </FormItem>
        <FormField
          control={form.control}
          name="school_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel Escolar</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Educación Básica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="reason_for_consultation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo de Consulta</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe el motivo de la consulta..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="medical_diagnosis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Diagnóstico Médico</FormLabel>
            <FormControl>
              <Textarea placeholder="Añade diagnósticos médicos relevantes..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">II. ANTECEDENTES ANAMNÉSICOS RELEVANTES</h3>
      <FormField
        control={form.control}
        name="anamnesis_info"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Información Recopilada</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalles de la anamnesis..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="family_context"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto Familiar</FormLabel>
            <FormControl>
              <Textarea placeholder="Información sobre el entorno familiar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="previous_therapies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Terapias Previas</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalles de terapias fonoaudiológicas o de otro tipo previas..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">III. CONTEXTO DE EVALUACIÓN</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="evaluation_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condiciones del Entorno</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe las condiciones del ambiente de evaluación..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hearing_aids_use"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uso de Dispositivos Auditivos</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Audífono bilateral, Implante Coclear" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold mt-8">IV. INSTRUMENTOS DE EVALUACIÓN</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="applied_tests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tests Aplicados</FormLabel>
              <FormControl>
                <Textarea placeholder="Lista de pruebas estandarizadas o informales aplicadas..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clinical_observation_methods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Métodos de Observación Clínica</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe los métodos de observación utilizados..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold mt-8">V. HALLAZGOS DE EVALUACIÓN</h3>
      <FormField
        control={form.control}
        name="speech_anatomical_structures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estructuras Anatómicas del Habla</FormLabel>
            <FormControl>
              <Textarea placeholder="Observaciones sobre la anatomía y función de las estructuras del habla..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <h4 className="text-md font-medium mt-4">Percepción Acústica</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="acoustic_perception_detection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detección</FormLabel>
              <FormControl>
                <Input placeholder="Hallazgos en detección de sonidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acoustic_perception_discrimination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discriminación</FormLabel>
              <FormControl>
                <Input placeholder="Hallazgos en discriminación de sonidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acoustic_perception_identification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificación</FormLabel>
              <FormControl>
                <Input placeholder="Hallazgos en identificación de sonidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acoustic_perception_recognition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reconocimiento</FormLabel>
              <FormControl>
                <Input placeholder="Hallazgos en reconocimiento de sonidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acoustic_perception_comprehension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comprensión</FormLabel>
              <FormControl>
                <Input placeholder="Hallazgos en comprensión de sonidos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h4 className="text-md font-medium mt-4">Habilidades Lingüísticas</h4>
      <FormField
        control={form.control}
        name="linguistic_skills_language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lenguaje</FormLabel>
            <FormControl>
              <Textarea placeholder="Hallazgos en habilidades de lenguaje (fonología, morfología, sintaxis)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="linguistic_skills_semantics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Semántica</FormLabel>
            <FormControl>
              <Textarea placeholder="Hallazgos en habilidades semánticas (vocabulario, significado)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="linguistic_skills_literacy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lectoescritura</FormLabel>
            <FormControl>
              <Textarea placeholder="Hallazgos en habilidades de lectoescritura..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="linguistic_skills_pragmatics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pragmática</FormLabel>
            <FormControl>
              <Textarea placeholder="Hallazgos en habilidades pragmáticas (uso social del lenguaje)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VI. SÍNTESIS DE LA EVALUACIÓN</h3>
      <FormField
        control={form.control}
        name="synthesis_comprehensive_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel Comprensivo</FormLabel>
            <FormControl>
              <Textarea placeholder="Síntesis del nivel comprensivo del paciente..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="synthesis_expressive_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel Expresivo</FormLabel>
            <FormControl>
              <Textarea placeholder="Síntesis del nivel expresivo del paciente..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="synthesis_acoustic_perception"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Percepción Acústica</FormLabel>
            <FormControl>
              <Textarea placeholder="Síntesis de la percepción acústica..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VII. HIPÓTESIS DIAGNÓSTICA</h3>
      <FormField
        control={form.control}
        name="phonodiagnosis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Diagnóstico Fonoaudiológico</FormLabel>
            <FormControl>
              <Textarea placeholder="Hipótesis diagnóstica fonoaudiológica..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">VIII. OBSERVACIONES Y/O SUGERENCIAS</h3>
      <FormField
        control={form.control}
        name="observations_suggestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recomendaciones Terapéuticas</FormLabel>
            <FormControl>
              <Textarea placeholder="Recomendaciones para el paciente y/o familia..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EvaluationFields;