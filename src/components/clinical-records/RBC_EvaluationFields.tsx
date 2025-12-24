"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClinicalRecordFormValues } from "./ClinicalRecordForm"; // Import the type

interface RBC_EvaluationFieldsProps {
  form: UseFormReturn<ClinicalRecordFormValues>;
  patientNameDisplay?: string;
  patientAgeDisplay?: number;
  patientRutDisplay?: string;
  patientPhoneDisplay?: string;
  room?: string;
}

const RBC_EvaluationFields: React.FC<RBC_EvaluationFieldsProps> = ({
  form,
  patientNameDisplay,
  patientAgeDisplay,
  patientRutDisplay,
  patientPhoneDisplay,
  room,
}) => {
  return (
    <div className="space-y-6">
      {room && (
        <h2 className="text-xl font-bold mb-4">Evaluación para Sala: {room}</h2>
      )}
      {/* 1. DATOS DE IDENTIFICACIÓN */}
      <h3 className="text-lg font-semibold">1. DATOS DE IDENTIFICACIÓN</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormItem>
          <FormLabel>Nombre completo</FormLabel>
          <FormControl>
            <Input value={patientNameDisplay || "N/A"} disabled />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Edad</FormLabel>
          <FormControl>
            <Input value={patientAgeDisplay !== undefined ? patientAgeDisplay.toString() : "N/A"} disabled />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>RUT</FormLabel>
          <FormControl>
            <Input value={patientRutDisplay || "N/A"} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="school_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escolaridad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione escolaridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basica-incompleta">Básica Incompleta</SelectItem>
                  <SelectItem value="basica-completa">Básica Completa</SelectItem>
                  <SelectItem value="media-incompleta">Media Incompleta</SelectItem>
                  <SelectItem value="media-completa">Media Completa</SelectItem>
                  <SelectItem value="superior-incompleta">Superior Incompleta</SelectItem>
                  <SelectItem value="superior-completa">Superior Completa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lateralidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lateralidad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione lateralidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="diestro">Diestro</SelectItem>
                  <SelectItem value="zurdo">Zurdo</SelectItem>
                  <SelectItem value="ambidiestro">Ambidiestro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Calle Falsa 123, Ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Teléfono de Contacto</FormLabel>
          <FormControl>
            <Input value={patientPhoneDisplay || "N/A"} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="ocupacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ocupación</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Contador Auditor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosticos_previos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnósticos Previos</FormLabel>
              <FormControl>
                <Input placeholder="Ej: ACV, TCE, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason_for_consultation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo de consulta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Derivación desde medicina general" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 2. ANTECEDENTES ANAMNÉSICOS RELEVANTES */}
      <h3 className="text-lg font-semibold mt-8">2. ANTECEDENTES ANAMNÉSICOS RELEVANTES</h3>
      <FormField
        control={form.control}
        name="anamnesis_info" // Reusing existing field for description
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción del paciente y antecedentes relevantes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describir brevemente el perfil del paciente, eventos relevantes, contexto familiar, laboral, etc."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 3. INSTRUMENTOS DE EVALUACIÓN UTILIZADOS */}
      <h3 className="text-lg font-semibold mt-8">3. INSTRUMENTOS DE EVALUACIÓN UTILIZADOS</h3>
      <Tabs defaultValue="lenguaje" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lenguaje">Lenguaje</TabsTrigger>
          <TabsTrigger value="calidad-vida">Calidad de Vida</TabsTrigger>
          <TabsTrigger value="cognitivo">Cognitivo-Com.</TabsTrigger>
          <TabsTrigger value="ofa">OFA</TabsTrigger>
        </TabsList>

        <TabsContent value="lenguaje" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instrumento_plepaf"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>PLEPAF</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instrumento_test_boston"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Test de Boston</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instrumento_protocolo_pragmatico"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Protocolo pragmático (abreviado) Carol Prutting y Diane Kirchne</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="calidad-vida" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instrumento_ceti"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>CETI (participación)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instrumento_cadl2"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>CADL-2 (actividad)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="cognitivo" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instrumento_ace_r"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>ACE-R</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instrumento_protocolo_cognitivo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Protocolo de evaluación fonoaudiológica cognitiva - comunicativa</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="ofa" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instrumento_pauta_ofa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Pauta informal de OFA</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-4" />

      <FormField
        control={form.control}
        name="otros_instrumentos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Otros instrumentos utilizados</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Especificar otros tests o protocolos utilizados"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 4. HALLAZGOS EVALUACIÓN */}
      <h3 className="text-lg font-semibold mt-8">4. HALLAZGOS EVALUACIÓN</h3>
      <div className="space-y-6">
        {/* 4.1 Órganos Fonoarticulatorios */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.1 Observación Órganos Fonoarticulatorios</h4>
          <FormField
            control={form.control}
            name="organos_fonoarticulatorios"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir las características observadas en la evaluación de órganos fonoarticulatorios"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.2 Audición */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.2 AUDICIÓN</h4>
          <FormField
            control={form.control}
            name="audicion"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir hallazgos de la evaluación auditiva o indicar si no se realizó evaluación"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.3 Deglución */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.3 DEGLUCIÓN</h4>
          <FormField
            control={form.control}
            name="deglucion"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir hallazgos de la evaluación de deglución o indicar si no se realizó evaluación"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.4 Características Vocales */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.4 CARACTERÍSTICAS VOCALES</h4>
          <FormField
            control={form.control}
            name="caracteristicas_vocales"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir las características vocales observadas (timbre, intensidad, tono, etc.)"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.5 Características de Habla */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.5 CARACTERÍSTICAS DE HABLA</h4>
          <FormField
            control={form.control}
            name="caracteristicas_habla"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir prosodia, articulación, fluidez, ritmo, etc."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.6 Características Lingüísticas */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.6 CARACTERÍSTICAS LINGÜÍSTICAS</h4>
          <FormField
            control={form.control}
            name="caracteristicas_linguisticas"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describir hallazgos en nivel léxico-semántico, pragmático, sintáctico, etc."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4.7 Características Cognitivas y Comunicativas */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">4.7 CARACTERÍSTICAS COGNITIVAS Y COMUNICATIVAS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="caracteristicas_cognitivas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognitivas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Atención, memoria, funciones ejecutivas, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caracteristicas_comunicativas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comunicativas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Discurso, narración, conversación, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* 5. CATEGORÍA DIAGNÓSTICA */}
      <h3 className="text-lg font-semibold mt-8">5. CATEGORÍA DIAGNÓSTICA</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="hipotesis_diagnostica"
          render={({ field }) => (
            <FormItem>
              <FormLabel>a. Hipótesis Diagnóstica</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Posible Trastorno cognitivo-comunicativo secundario a lesión de hemisferio derecho"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="severidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I. Severidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione severidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="severo">Severo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="justificacion_diagnostico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificación del diagnóstico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Fundamentar el diagnóstico basado en los hallazgos de la evaluación"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 6. OBSERVACIONES/SUGERENCIAS */}
      <h3 className="text-lg font-semibold mt-8">6. OBSERVACIONES/SUGERENCIAS</h3>
      <FormField
        control={form.control}
        name="observations_suggestions" // Reusing existing field
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recomendaciones y sugerencias terapéuticas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej: Se sugiere seguir con la terapia Fonoaudiológica. Frecuencia: 2 veces por semana durante 3 meses."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 7. DERIVACIÓN */}
      <h3 className="text-lg font-semibold mt-8">7. DERIVACIÓN</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="derivacion_psicologo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Psicólogo</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="derivacion_otra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Otras derivaciones (especificar)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Especificar otros profesionales o servicios a los que se deriva al paciente"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre_evaluador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y Firma Evaluador</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo del fonoaudiólogo evaluador" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default RBC_EvaluationFields;