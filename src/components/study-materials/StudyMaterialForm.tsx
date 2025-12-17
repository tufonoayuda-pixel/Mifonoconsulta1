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
import { FileText, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

const studyMaterialFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "El nombre es obligatorio." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "La categoría es obligatoria." }),
  external_url: z.string().url({ message: "URL inválida." }).optional().or(z.literal("")),
  file: z.any().optional(), // For file upload
});

type StudyMaterialFormValues = z.infer<typeof studyMaterialFormSchema>;

interface StudyMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (material: StudyMaterial, file?: File) => void;
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
      file: undefined,
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description || "",
        category: initialData.category,
        external_url: initialData.external_url || "",
        file: undefined, // Clear file input on edit
      });
      setSelectedFile(null);
    } else {
      form.reset({
        name: "",
        description: "",
        category: "",
        external_url: "",
        file: undefined,
      });
      setSelectedFile(null);
    }
  }, [initialData, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      form.setValue("file", event.target.files[0]);
    } else {
      setSelectedFile(null);
      form.setValue("file", undefined);
    }
  };

  const handleSubmit = (values: StudyMaterialFormValues) => {
    const materialToSubmit: StudyMaterial = {
      id: values.id || "",
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      external_url: values.external_url || undefined,
      file_url: initialData?.file_url || undefined, // Keep existing file_url if not uploading new
      file_path: initialData?.file_path || undefined, // Keep existing file_path if not uploading new
    };

    onSubmit(materialToSubmit, selectedFile || undefined);
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
    "Material de Estudio General", // New category for study materials
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

            <FormItem>
              <FormLabel>Subir Archivo (PDF)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                  )}
                  {initialData?.file_url && !selectedFile && (
                    <a
                      href={initialData.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <FileText className="h-4 w-4" />
                      Ver archivo actual
                    </a>
                  )}
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Sube un archivo PDF o proporciona un enlace externo. No puedes tener ambos.
              </p>
            </FormItem>

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