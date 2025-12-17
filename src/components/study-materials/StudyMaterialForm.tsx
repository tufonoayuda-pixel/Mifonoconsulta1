"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyMaterial } from "@/types/study-material";
import { showSuccess, showError } from "@/utils/toast";

const studyMaterialFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "El nombre es obligatorio." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "La categoría es obligatoria." }),
  external_url: z.string().url({ message: "URL inválida." }).optional().or(z.literal("")),
}).refine((data) => {
  // For new materials, external_url is required
  if (!data.id && !data.external_url) {
    return false;
  }
  return true;
}, {
  message: "Para nuevos materiales, el enlace externo es obligatorio.",
  path: ["external_url"],
});

type StudyMaterialFormValues = z.infer<typeof studyMaterialFormSchema>;

interface StudyMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (material: StudyMaterial) => void; // Removed file parameter
  initialData?: StudyMaterial | null;
  isSubmitting: boolean;
}

const StudyMaterialForm: React.FC<StudyMaterialFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const form = useForm<StudyMaterialFormValues>({
    resolver: zodResolver(studyMaterialFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      external_url: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description || "",
        category: initialData.category,
        external_url: initialData.external_url || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        category: "",
        external_url: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: StudyMaterialFormValues) => {
    const materialToSubmit: StudyMaterial = {
      id: values.id || "",
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      external_url: values.external_url || undefined,
      // file_url and file_path are no longer managed by the form
      file_url: initialData?.file_url, // Keep existing file_url if present
      file_path: initialData?.file_path, // Keep existing file_path if present
    };

    onSubmit(materialToSubmit); // Removed file parameter
  };

  const currentCategories = [
    "Audiología",
    "Deglución Adulto",
    "Lenguaje Adulto",
    "Habla Adulto",
    "Cognición Adulto",
    "Voz Adulto",
    "Calidad de Vida",
    "Herramientas Generales",
    "Material de Estudio General",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Material de Estudio" : "Añadir Material de Estudio"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Material</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Guía de Evaluación Auditiva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del material..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentCategories.map((category) => (
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
            <FormField
              control={form.control}
              name="external_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enlace Externo (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: https://ejemplo.com/material" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : (initialData ? "Actualizar Material" : "Añadir Material")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StudyMaterialForm;