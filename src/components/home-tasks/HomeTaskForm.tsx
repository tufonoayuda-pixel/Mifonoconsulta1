"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { HomeTask } from "@/types/home-task";
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import ImageUpload from "@/components/ImageUpload"; // Updated import path

const homeTaskFormSchema = z.object({
  id: z.string().optional(),
  patient_id: z.string().min(1, { message: "Paciente es obligatorio." }),
  title: z.string().min(1, { message: "El título es obligatorio." }),
  description: z.string().optional(),
  due_date: z.string().optional().nullable(), // YYYY-MM-DD
  status: z.enum(["assigned", "completed"]).default("assigned"),
  image_url: z.string().optional().nullable(), // New: Optional image URL
  image_path: z.string().optional().nullable(), // New: Optional image path
});

type HomeTaskFormValues = z.infer<typeof homeTaskFormSchema>;

interface HomeTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: HomeTask) => void;
  initialData?: HomeTask | null;
  availablePatients: Patient[];
  isSubmitting: boolean; // Added for loading state
}

const HomeTaskForm: React.FC<HomeTaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availablePatients,
  isSubmitting,
}) => {
  const form = useForm<HomeTaskFormValues>({
    resolver: zodResolver(homeTaskFormSchema),
    defaultValues: {
      patient_id: "",
      title: "",
      description: "",
      due_date: format(new Date(), "yyyy-MM-dd"),
      status: "assigned",
      image_url: null,
      image_path: null,
    },
  });

  const { user } = useSession();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        patient_id: initialData.patient_id,
        title: initialData.title,
        description: initialData.description || "",
        due_date: initialData.due_date || format(new Date(), "yyyy-MM-dd"),
        status: initialData.status,
        image_url: initialData.image_url || null,
        image_path: initialData.image_path || null,
      });
      setSelectedImageFile(null); // Clear selected file on reset
    } else {
      form.reset({
        patient_id: "",
        title: "",
        description: "",
        due_date: format(new Date(), "yyyy-MM-dd"),
        status: "assigned",
        image_url: null,
        image_path: null,
      });
      setSelectedImageFile(null); // Clear selected file on reset
    }
  }, [initialData, form]);

  const handleSubmit = async (values: HomeTaskFormValues) => {
    if (!user?.id) {
      showError("Usuario no autenticado.");
      return;
    }

    let imageUrl: string | null = values.image_url || null;
    let imagePath: string | null = values.image_path || null;

    try {
      // Handle image upload if a new file is selected
      if (selectedImageFile) {
        // Delete old image from storage if it exists
        if (initialData?.image_path) {
          await supabase.onlineClient.storage.from("home-task-images").remove([initialData.image_path]);
        }

        const fileExtension = selectedImageFile.name.split(".").pop();
        const filePath = `${user.id}/${values.patient_id}/${crypto.randomUUID()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabase.onlineClient.storage
          .from("home-task-images")
          .upload(filePath, selectedImageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.onlineClient.storage
          .from("home-task-images")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          imageUrl = publicUrlData.publicUrl;
          imagePath = filePath;
        }
      } else if (initialData?.image_path && !values.image_url) {
        // If there was an initial image but it's now removed from the form
        await supabase.onlineClient.storage.from("home-task-images").remove([initialData.image_path]);
        imageUrl = null;
        imagePath = null;
      }

      const taskToSubmit: HomeTask = {
        ...values,
        user_id: user.id,
        image_url: imageUrl,
        image_path: imagePath,
      };

      onSubmit(taskToSubmit);
      setSelectedImageFile(null); // Clear selected file after submission
    } catch (error: any) {
      showError("Error al guardar la tarea: " + error.message);
      console.error("Error saving home task:", error);
    }
  };

  const selectedPatient = availablePatients.find(p => p.id === form.watch("patient_id"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Tarea para Casa" : "Asignar Nueva Tarea"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un paciente">
                          {selectedPatient ? `${selectedPatient.name} (RUT: ${selectedPatient.rut})` : "Selecciona un paciente"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} (RUT: {patient.rut})
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Tarea</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ejercicios de articulación /s/" {...field} />
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
                    <Textarea placeholder="Detalles de la tarea y cómo realizarla..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Límite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(parseISO(field.value), "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            } else {
                              field.onChange("");
                            }
                          }}
                          initialFocus
                          locale={es}
                          defaultMonth={new Date()}
                          fromYear={2020}
                          toYear={2030}
                          captionLayout="dropdown-buttons"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assigned">Asignada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-semibold mt-4">Imagen de Referencia (Opcional)</h3>
            <ImageUpload
              onImageChange={setSelectedImageFile}
              initialImageUrl={initialData?.image_url}
              disabled={isSubmitting}
              label="Arrastra y suelta una imagen aquí, o haz clic para seleccionar"
              description="(JPG, PNG, GIF - máximo 5MB)"
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : (initialData ? "Guardar Cambios" : "Asignar Tarea")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HomeTaskForm;