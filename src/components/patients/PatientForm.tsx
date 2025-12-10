"use client";

import React, { useEffect } from "react";
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
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast"; // Import toast utilities

const patientFormSchema = z.object({
  id: z.string().optional(),
  rut: z.string().min(1, { message: "RUT es obligatorio." }),
  name: z.string().min(1, { message: "Nombre es obligatorio." }),
  phone: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  preferredRoom: z.string().optional(),
  preferredDay: z.string().optional(),
  preferredTime: z.string().optional(),
  serviceType: z.string().optional(),
  observations: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Patient) => void;
  initialData?: Patient | null;
  existingRuts?: string[]; // To check for duplicates
}

const PatientForm: React.FC<PatientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingRuts = [],
}) => {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData || {
      rut: "",
      name: "",
      phone: "",
      age: undefined,
      preferredRoom: "",
      preferredDay: "",
      preferredTime: "",
      serviceType: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        rut: "",
        name: "",
        phone: "",
        age: undefined,
        preferredRoom: "",
        preferredDay: "",
        preferredTime: "",
        serviceType: "",
        observations: "",
      });
    }
  }, [initialData, form]);

  const selectedRoom = form.watch("preferredRoom");
  const selectedDay = form.watch("preferredDay");

  const getServiceTypeOptions = (room?: string) => {
    switch (room) {
      case "UAPORRINO":
        return ["Evaluación Nueva", "Fonoaudiología Ingreso", "Rehabilitación Auditiva Individual"];
      case "RBC":
        return ["Control Fonoaudiólogo", "Evaluación Ingreso Neurológico Preferente", "Ingreso Fonoaudiología"];
      default:
        return ["Sin preferencia"];
    }
  };

  const handleSubmit = (values: PatientFormValues) => {
    if (!initialData && existingRuts.includes(values.rut)) {
      showError("El RUT ingresado ya existe para otro paciente.");
      return;
    }
    onSubmit(values as Patient);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Paciente" : "Añadir Paciente"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="rut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUT</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 12.345.678-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: +56912345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredRoom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sala de Preferencia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sala" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UAPORRINO">UAPORRINO</SelectItem>
                      <SelectItem value="RBC">RBC</SelectItem>
                      <SelectItem value="Sin preferencia">Sin preferencia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Prestación</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getServiceTypeOptions(selectedRoom).map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Atención Preferido</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedRoom || selectedRoom === "Sin preferencia"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un día" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Sin preferencia"].map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de Atención Preferida</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      disabled={!selectedRoom || selectedRoom === "Sin preferencia" || !selectedDay || selectedDay === "Sin preferencia"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones Adicionales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade cualquier observación relevante..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{initialData ? "Guardar Cambios" : "Añadir Paciente"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientForm;