"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProtocolItem {
  name: string;
  description: string;
  url?: string;
}

interface ProtocolCategory {
  category: string;
  items: ProtocolItem[];
}

const protocolsData: ProtocolCategory[] = [
  {
    category: "Herramientas Generales",
    items: [
      {
        name: "Ficha Clínica El Barrero",
        description: "Acceso a la ficha clínica digitalizada para el centro El Barrero.",
        url: "https://fichaclinic-elbarrero.space.z.ai/",
      },
      {
        name: "Temporizador de Sesión Fonoaudiológica",
        description: "Herramienta para gestionar el tiempo durante las sesiones clínicas.",
        url: "https://rehabaud2.space.z.ai/",
      },
    ],
  },
  {
    category: "Audiología",
    items: [
      {
        name: "Cuestionarios HHIE-S y IOI-HA",
        description: "Cuestionarios para evaluar el impacto de la pérdida auditiva y el beneficio del audífono.",
        url: "https://rehabaud1.space.z.ai/",
      },
      {
        name: "Test Sonidos de Ling",
        description: "Herramienta para evaluar la percepción de los sonidos del habla en niños con implantes cocleares o audífonos.",
        url: "https://testsonidosling.space.z.ai/",
      },
      {
        name: "Test Wepman (Discriminación Auditiva)",
        description: "Prueba para evaluar la capacidad de discriminación auditiva de pares mínimos.",
        url: "https://testwepman.space.z.ai/",
      },
      {
        name: "Test ESP",
        description: "Evaluación de la Percepción del Habla (ESP) para niños.",
        url: "https://audio-testesp.space.z.ai/",
      },
      {
        name: "Matriz de Consonantes",
        description: "Herramienta para la evaluación de la percepción de consonantes.",
        url: "https://matrizconsonantes.space.z.ai/",
      },
      {
        name: "Matriz de Vocales",
        description: "Herramienta para la evaluación de la percepción de vocales.",
        url: "https://test-matrizvocales.space.z.ai/",
      },
      {
        name: "PRUEBA DE IDENTIFICACIÓN DE PALABRAS A TRAVÉS DE CONSONANTES (PIP-C)",
        description: "Prueba específica para la identificación de palabras basada en consonantes.",
        url: "https://test-pipc.space.z.ai/",
      },
      {
        name: "Prueba de Identificación de Palabras a través de Suprasegmentales (PIP-S)",
        description: "Prueba para la identificación de palabras utilizando características suprasegmentales.",
        url: "https://test-pips.space.z.ai/",
      },
      {
        name: "Prueba de Identificación de Palabras a través de Vocales (PIP-V)",
        description: "Prueba para la identificación de palabras enfocada en vocales.",
        url: "https://test-pipv.space.z.ai/",
      },
      {
        name: "Lista de Oraciones en Forma Abierto (OFA-N)",
        description: "Evaluación de la comprensión de oraciones en formato abierto.",
        url: "https://test-ofa-n.space.z.ai/",
      },
      {
        name: "PROTOCOLO DE REGISTRO GASP TEST (Glendonald Auditory Screening Procedure)",
        description: "Protocolo para el registro del Glendonald Auditory Screening Procedure.",
        url: "https://test-gasp.space.z.ai/",
      },
      {
        name: "Escala CHAN-I (Evaluación de la Comprensión del Habla en Ambientes Naturales)",
        description: "Escala para evaluar la comprensión del habla en diferentes entornos naturales.",
        url: "https://escala-chan-i.space.z.ai/",
      },
      {
        name: "Audiometro Casero",
        description: "Herramienta para realizar una evaluación auditiva básica.",
        url: "https://audiometro-casero2.vercel.app/",
      },
      {
        name: "Inventario de Incapacidad de Tinnitus",
        description: "Escala para evaluar la severidad y el impacto del tinnitus.",
        url: "https://escaudio-tinnitus.space.z.ai/",
      },
      {
        name: "Evaluación Informal del Tinnitus",
        description: "Herramienta para una evaluación rápida y cualitativa del tinnitus.",
        url: "https://evtinnitus1.vercel.app/",
      },
      {
        name: "Entrenamiento Binaural",
        description: "Herramienta para el entrenamiento de la audición binaural.",
        url: "https://ent-binaural1.space.z.ai",
      },
      {
        name: "Enmascarador de Tinnitus",
        description: "Herramienta para generar sonidos que ayuden a enmascarar el tinnitus.",
        url: "https://enmascarador-tinnitus1.space.z.ai",
      },
      {
        name: "Localización Auditiva",
        description: "Herramienta para trabajar la localización auditiva.",
        url: "https://localizacion-auditiva.space.z.ai",
      },
      {
        name: "Entrenador Binaural",
        description: "Otra herramienta para el entrenamiento de la audición binaural.",
        url: "https://entrenamientobinaural1.vercel.app/",
      },
      {
        name: "Enmascarador de Tinnitus (Alternativo)",
        description: "Otra herramienta para generar sonidos que ayuden a enmascarar el tinnitus.",
        url: "https://tinnitus-masker2.vercel.app/",
      },
    ],
  },
  {
    category: "Deglución Adulto",
    items: [
      {
        name: "EIDEFO",
        description: "Plataforma de evaluación de disfagia. Para ingresar es usuario: test y clave: password.",
        url: "https://eidefo2.vercel.app/login",
      },
      {
        name: "Escala de Severidad de Disfagia",
        description: "Herramienta para evaluar la severidad de la disfagia en adultos.",
        url: "https://escala-severidaddisfagia.space.z.ai/",
      },
      {
        name: "SWAL-QOL (Calidad de Vida en Disfagia)",
        description: "Cuestionario para evaluar la calidad de vida relacionada con la deglución.",
        url: "https://escdeglu-swalqol.space.z.ai",
      },
      {
        name: "DHI (Índice de Discapacidad por Disfagia)",
        description: "Cuestionario para evaluar el impacto de la disfagia en la calidad de vida.",
        url: "https://deglu-dhi.space.z.ai",
      },
      {
        name: "EAT-10 (Eating Assessment Tool)",
        description: "Cuestionario de 10 ítems para la detección y evaluación de la disfagia.",
        url: "https://deglu-eat10.space.z.ai",
      },
      {
        name: "GUSS (Gugging Swallowing Screen)",
        description: "Herramienta de cribado para la detección de disfagia en pacientes con accidente cerebrovascular.",
        url: "https://screen-gussmecv.space.z.ai",
      },
      {
        name: "OME (Evaluación Oro-Motora y de la Deglución)",
        description: "Protocolo para la evaluación de las estructuras oromotoras y la función de deglución.",
        url: "https://evdeglu-ome.space.z.ai",
      },
      {
        name: "OHAT (Oral Health Assessment Tool)",
        description: "Herramienta para la evaluación de la salud oral en pacientes con disfagia.",
        url: "https://evaldeglu-ohat.space.z.ai",
      },
    ],
  },
  {
    category: "Lenguaje Adulto",
    items: [
      {
        name: "CETI (Índice de Eficacia Comunicativa)",
        description: "Herramienta para medir la eficacia comunicativa en adultos.",
        url: "https://pauta-ceti.space.z.ai",
      },
      {
        name: "Screening Afasia",
        description: "Herramienta de cribado rápido para detectar posibles afasias.",
        url: "https://scr-mast.space.z.ai",
      },
      {
        name: "SAQOL-39 (Calidad de Vida en Afasia)",
        description: "Cuestionario para evaluar la calidad de vida en personas con afasia.",
        url: "https://calvid-saqol39.space.z.ai",
      },
    ],
  },
  {
    category: "Habla Adulto",
    items: [
      {
        name: "Qol-Dis (Calidad de vida del hablante disártrico)",
        description: "Cuestionario para evaluar la calidad de vida en personas con disartria.",
        url: "https://pauta-ceti.space.z.ai",
      },
      {
        name: "PEVH ADULTO ABREVIADO",
        description: "Protocolo de Evaluación Vocal Hablada para adultos (versión abreviada).",
        url: "https://pevh-adulto.space.z.ai",
      },
      {
        name: "Escala de Inteligibilidad del Habla",
        description: "Herramienta para evaluar la inteligibilidad del habla en adultos.",
        url: "https://ev-integilibilidadduffy.space.z.ai",
      },
    ],
  },
  {
    category: "Cognición Adulto",
    items: [
      {
        name: "ACE-R-CH",
        description: "Evaluación Cognitiva de Cambridge Revisada (versión chilena).",
        url: "https://scr-acerch.space.z.ai/",
      },
      {
        name: "MOCA (Evaluación Cognitiva Montreal)",
        description: "Herramienta de cribado para la detección de deterioro cognitivo leve.",
        url: "https://pauta-ceti.space.z.ai",
      },
    ],
  },
  {
    category: "Voz Adulto",
    items: [
      {
        name: "Protocolo de Voz Hablada",
        description: "Protocolo para la evaluación y registro de la voz hablada en adultos.",
        url: "https://voz-hablada.space.z.ai",
      },
      {
        name: "LAB VOZ",
        description: "Plataforma para el análisis y entrenamiento de la voz.",
        url: "https://lab-voz.vercel.app/",
      },
      {
        name: "VHI-30 (Índice de Incapacidad Vocal)",
        description: "Cuestionario para evaluar el impacto de los problemas de voz en la calidad de vida.",
        url: "https://voz-vhi30.space.z.ai",
      },
    ],
  },
  {
    category: "Calidad de Vida",
    items: [
      {
        name: "Escala de Depresión Geriátrica de Yesavage",
        description: "Escala para la detección de depresión en la población geriátrica.",
        url: "https://escala-yes1.space.z.ai/",
      },
      {
        name: "Escala de Lawton y Brody (AIVD)",
        description: "Evaluación de las Actividades Instrumentales de la Vida Diaria.",
        url: "https://calvida-esclawtonybrody.space.z.ai",
      },
      {
        name: "Índice de Barthel",
        description: "Evaluación de las Actividades Básicas de la Vida Diaria.",
        url: "https://calvida-barthel.space.z.ai",
      },
      {
        name: "TADL-Q (Test de Actividades de la Vida Diaria - Cuestionario)",
        description: "Cuestionario para evaluar la capacidad de realizar actividades de la vida diaria.",
        url: "https://calvida-tadlq.space.z.ai",
      },
      {
        name: "CADL-2 (Comunicative Activities of Daily Living - 2)",
        description: "Evaluación de las habilidades comunicativas funcionales en contextos de la vida diaria.",
        url: "https://calvida-cadl2.space.z.ai",
      },
    ],
  },
  {
    category: "Motricidad Orofacial",
    items: [
      {
        name: "VFRV (Valoración Funcional de la Respiración y la Voz)",
        description: "Protocolo para la valoración funcional de la respiración y la voz.",
        url: "https://mo-vfrv.space.z.ai",
      },
      {
        name: "Parálisis Facial",
        description: "Herramienta para la evaluación y seguimiento de la parálisis facial.",
        url: "https://mo-paralfacial.space.z.ai",
      },
    ],
  },
];

const ProtocolsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Protocolos Clínicos Digitalizados</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Aquí encontrarás una colección de protocolos clínicos organizados por área, para facilitar tu práctica fonoaudiológica.
        </p>
      </div>

      <Accordion type="multiple" className="w-full">
        {protocolsData.map((categoryData, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="flex items-center gap-3 text-xl font-semibold">
              <List className="h-5 w-5 text-muted-foreground" />
              {categoryData.category}
            </AccordionTrigger>
            <AccordionContent className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryData.items.map((protocol, itemIndex) => (
                <Card key={itemIndex} className="border-l-4 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {protocol.url ? (
                        <a
                          href={protocol.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          {protocol.name}
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ) : (
                        <span>{protocol.name}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{protocol.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProtocolsPage;