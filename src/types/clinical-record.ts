export type ClinicalRecordType = "Evaluación" | "Plan de Intervención" | "Registro de Sesión";

export interface BaseClinicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: ClinicalRecordType;
  recordDate: string; // YYYY-MM-DD
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  attachments: { name: string; url: string; type: string }[]; // Simulated file attachments
}

// --- Evaluation Record Specific Fields ---
export interface EvaluationRecordData {
  // I. ANTECEDENTES DE IDENTIFICACIÓN
  patientRut: string; // Disabled, derived from patientId
  patientAge: number | undefined; // Disabled, derived from patientId
  schoolLevel?: string;
  reasonForConsultation?: string;
  medicalDiagnosis?: string;

  // II. ANTECEDENTES ANAMNÉSICOS RELEVANTES
  anamnesisInfo?: string;
  familyContext?: string;
  previousTherapies?: string;

  // III. CONTEXTO DE EVALUACIÓN
  environmentConditions?: string;
  hearingAidUse?: string;

  // IV. INSTRUMENTOS DE EVALUACIÓN
  appliedTests?: string;
  clinicalObservationMethods?: string;

  // V. HALLAZGOS DE EVALUACIÓN
  speechAnatomyStructures?: string;
  acousticPerceptionDetection?: string;
  acousticPerceptionDiscrimination?: string;
  acousticPerceptionIdentification?: string;
  acousticPerceptionRecognition?: string;
  acousticPerceptionComprehension?: string;
  linguisticSkillsLanguage?: string;
  linguisticSkillsSemantics?: string;
  linguisticSkillsLiteracy?: string;
  linguisticSkillsPragmatics?: string;

  // VI. SÍNTESIS DE LA EVALUACIÓN
  comprehensiveLevel?: string;
  expressiveLevel?: string;
  acousticPerceptionSynthesis?: string;

  // VII. HIPÓTESIS DIAGNÓSTICA
  fonoaudiologicalDiagnosis?: string;

  // VIII. OBSERVACIONES Y/O SUGERENCIAS
  therapeuticRecommendations?: string;
}

export interface EvaluationClinicalRecord extends BaseClinicalRecord {
  recordType: "Evaluación";
  data: EvaluationRecordData;
}

// --- Intervention Plan Specific Fields ---
export type GeersMoogCategory = "Detección" | "Discriminación" | "Identificación" | "Reconocimiento" | "Comprensión";
export type MethodologyType = "Terapia Auditiva Verbal" | "Enfoque Bilingüe Bicultural" | "Comunicación Total";
export type InterventionFocus = "Directo" | "Indirecto" | "Mixto";
export type Modality = "Individual" | "Grupal" | "Familiar";

export interface InterventionPlanRecordData {
  // I. IDENTIFICACIÓN DEL USUARIO
  patientNameDisplay: string; // Disabled, derived from patientId
  planDateDisplay: string; // Disabled, derived from recordDate
  patientAgeDisplay: number | undefined; // Disabled, derived from patientId
  schooling?: string;
  relevantClinicalInfo?: string;

  // II. HIPÓTESIS DE DIAGNÓSTICO FONOAUDIOLÓGICO
  mainDiagnosis?: string;
  geersMoogCategory?: GeersMoogCategory;

  // III. METODOLOGÍA A UTILIZAR
  mainMethodology?: MethodologyType;
  specificStrategies?: string;
  interventionFocus?: InterventionFocus;
  modality?: Modality;

  // IV. CONTENIDOS DE INTERVENCIÓN
  areasToWorkAuditorySkills?: string;
  areasToWorkSemantics?: string;
  areasToWorkInstructionFollowing?: string;
  areasToWorkCommunicativeIntention?: string;
  specificActivities?: string;
  materialsAndResources?: string;

  // V. OBJETIVO GENERAL (OG)
  generalObjective?: string;

  // VI. OBJETIVOS ESPECÍFICOS Y OPERACIONALES (O.E. y O.O.)
  specificAndOperationalObjectives?: string;

  // VII. OBSERVACIONES Y SEGUIMIENTO
  estimatedPlanDurationSessions?: number;
  sessionFrequency?: string;
  additionalObservations?: string;
}

export interface InterventionPlanClinicalRecord extends BaseClinicalRecord {
  recordType: "Plan de Intervención";
  data: InterventionPlanRecordData;
}

// --- Session Record Specific Fields ---
export interface SessionRecordData {
  sessionId?: string; // Optional, link to a specific session
  sessionObjectives?: string;
  activitiesPerformed?: string;
  observedAchievements?: string;
  additionalClinicalObservations?: string;
  patientResponse?: string;
  futurePlanning?: string;
}

export interface SessionClinicalRecord extends BaseClinicalRecord {
  recordType: "Registro de Sesión";
  data: SessionRecordData;
}

export type ClinicalRecord = EvaluationClinicalRecord | InterventionPlanClinicalRecord | SessionClinicalRecord;