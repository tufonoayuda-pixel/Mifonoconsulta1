export type ClinicalRecordType = "Evaluación" | "Plan de Intervención" | "Registro de Sesión";

export interface ClinicalRecord {
  id: string;
  patientId: string;
  patientName: string; // Para mostrar, no se almacena directamente en la tabla clinical_records
  type: ClinicalRecordType; // Renombrado de recordType para coincidir con la DB
  date: string; // Renombrado de recordDate para coincidir con la DB (YYYY-MM-DD)
  title: string;
  room?: string; // Campo para la sala de la evaluación

  createdAt: string; // Cadena ISO
  updatedAt: string; // Cadena ISO
  attachments: { name: string; url: string; type: string; path?: string }[]; // path es para la gestión en Supabase Storage

  // Campos específicos de Registro de Evaluación (UAPORRINO)
  school_level?: string;
  reason_for_consultation?: string;
  medical_diagnosis?: string;
  anamnesis_info?: string;
  family_context?: string;
  previous_therapies?: string;
  evaluation_conditions?: string;
  hearing_aids_use?: string;
  applied_tests?: string;
  clinical_observation_methods?: string;
  speech_anatomical_structures?: string;
  acoustic_perception_detection?: string;
  acoustic_perception_discrimination?: string;
  acoustic_perception_identification?: string;
  acoustic_perception_recognition?: string;
  acoustic_perception_comprehension?: string;
  linguistic_skills_language?: string;
  linguistic_skills_semantics?: string;
  linguistic_skills_literacy?: string;
  linguistic_skills_pragmatics?: string;
  synthesis_comprehensive_level?: string;
  synthesis_expressive_level?: string;
  synthesis_acoustic_perception?: string;
  phonodiagnosis?: string;
  observations_suggestions?: string;

  // Campos específicos de Registro de Evaluación (RBC) - Nuevos campos
  lateralidad?: string;
  direccion?: string;
  telefono?: string; // Ya existe en Patient, pero si es específico del informe, se puede duplicar o referenciar
  ocupacion?: string;
  diagnosticos_previos?: string;
  instrumento_plepaf?: boolean;
  instrumento_test_boston?: boolean;
  instrumento_protocolo_pragmatico?: boolean;
  instrumento_ceti?: boolean;
  instrumento_cadl2?: boolean;
  instrumento_ace_r?: boolean;
  instrumento_protocolo_cognitivo?: boolean;
  instrumento_pauta_ofa?: boolean;
  otros_instrumentos?: string;
  organos_fonoarticulatorios?: string;
  audicion?: string;
  deglucion?: string;
  caracteristicas_vocales?: string;
  caracteristicas_habla?: string;
  caracteristicas_linguisticas?: string;
  caracteristicas_cognitivas?: string;
  caracteristicas_comunicativas?: string;
  hipotesis_diagnostica?: string;
  severidad?: string;
  justificacion_diagnostico?: string;
  derivacion_psicologo?: boolean;
  derivacion_otra?: string;
  nombre_evaluador?: string;

  // Campos específicos de Plan de Intervención (mapeados a columnas de la DB)
  geers_moog_category?: "Detección" | "Discriminación" | "Identificación" | "Reconocimiento" | "Comprensión";
  auditory_verbal_therapy_methodology?: "Terapia Auditiva Verbal" | "Enfoque Bilingüe Bicultural" | "Comunicación Total";
  techniques_strategies?: string;
  intervention_focus?: "Directo" | "Indirecto" | "Mixto";
  modality?: "Individual" | "Grupal" | "Familiar";
  auditory_skills?: string;
  semantics_intervention?: string; // Renombrado para evitar conflicto con linguistic_skills_semantics
  instruction_following?: string;
  communicative_intent?: string;
  activities_specific?: string;
  materials_resources?: string;
  general_objective?: string;
  specific_operational_objectives?: string;
  plan_duration_estimated?: number;
  session_frequency?: string;

  // Campos específicos de Registro de Sesión (mapeados a columnas de la DB)
  session_id?: string;
  session_objectives?: string;
  activities_performed?: string;
  clinical_observations?: string;
  response_patient?: string;
  next_session?: string;
}