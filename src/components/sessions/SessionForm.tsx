"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from "date-fns"; // Import 'parse'
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";

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
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Session } from "@/types/session";
import { Patient } from "@/types/patient"; // Import Patient type

const sessionFormSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, { message: "Paciente es obligatorio." }), // Changed from patientName
  room: z.string().min(1, { message: "Sala es obligatoria." }),
  date: z.string().min(1, { message: "Fecha es obligatoria." }),
  time: z.string().min(1, { message: "Hora es obligatoria." }),
  duration: z.coerce.number().int().positive().min(1, { message: "Duración debe ser al menos 1 minuto." }).default(40),
  type: z.enum(["Evaluación", "Intervención", "Seguimiento", "Alta"], {
    message: "Tipo de sesión es obligatorio.",
  }),
  observations: z.string().optional(),
  // New fields for recurrence
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  recurrenceEndDate: z.string().optional(), // YYYY-MM-DD
}).superRefine((data, ctx) => { // Changed from .refine to .superRefine for better error messages
  if (data.isRecurring) {
    if (!data.recurrencePattern) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El patrón de recurrencia es obligatorio para sesiones recurrentes.",
        path: ["recurrencePattern"],
      });
    }
    if (!data.recurrenceEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin de recurrencia es obligatoria para sesiones recurrentes.",
        path: ["recurrenceEndDate"],
      });
    }
    if (data.recurrenceEndDate && data.date && data.recurrenceEndDate < data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin de recurrencia no puede ser anterior a la fecha de inicio.",
        path: ["recurrenceEndDate"],
      });
    }
  }
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: Session) => void;
  initialData?: Session | null;
  availablePatients: Patient[]; // List of patients to select from
}

const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availablePatients,
}) => {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      patientId: "", // Default to empty patientId
      room: "UAPORRINO", // Default room
      date: format(new Date(), "yyyy-MM-dd"), // Default to today's date
      time: format(new Date(), "HH:mm"), // Default to current time
      duration: 40, // Default duration
      type: "Intervención",
      observations: "",
      isRecurring: false, // Default to not recurring
      recurrencePattern: undefined,
      recurrenceEndDate: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      // When editing, map patientName from initialData to patientId for the form
      const patientIdFromInitialData = availablePatients.find(p => p.name === initialData.patientName)?.id || "";
      form.reset({
        ...initialData,
        patientId: patientIdFromInitialData, // Set patientId for the form
        date: initialData.date ? format(parse(initialData.date, "yyyy-MM-dd", new Date()), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        time: initialData.time || format(new Date(), "HH:mm"),
        duration: initialData.duration || 40,
        type: initialData.type || "Intervención",
        observations: initialData.observations || "",
        isRecurring: initialData.isRecurring || false,
        recurrencePattern: initialData.recurrencePattern || undefined,
        recurrenceEndDate: initialData.recurrenceEndDate || undefined,
      });
    } else {
      form.reset({
        patientId: "",
        room: "UAPORRINO",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        duration: 40,
        type: "Intervención",
        observations: "",
        isRecurring: false,
        recurrencePattern: undefined,
        recurrenceEndDate: undefined,
      });
    }
  }, [initialData, form, availablePatients]); // Added availablePatients to dependencies

  const isRecurring = form.watch("isRecurring");
  const selectedRoom = form.watch("room"); // Watch for changes in the room
  const selectedPatientId = form.watch("patientId"); // Watch for changes in patientId

  // Effect to update duration based on selected room
  useEffect(() => {
    if (selectedRoom === "UAPORRINO") {
      form.setValue("duration", 40);
    } else if (selectedRoom === "RBC") {
      form.setValue("duration", 60);
    }
  }, [selectedRoom, form]);

  const handleSubmit = (values: SessionFormValues) => {
    console.log("Form values submitted:", values); // Log submitted values
    // Find the patient name based on the selected patientId for the Session object
    const patientName = availablePatients.find(p => p.id === values.patientId)?.name || "Desconocido";
    onSubmit({ ...values, patientName: patientName } as Session); // Pass patientName back to onSubmit
    form.reset();
    onClose();
  };

  const selectedPatient = availablePatients.find(p => p.id === selectedPatientId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"> {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>{initialData && initialData.id ? "Editar Sesión" : "Programar Sesión"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId" // Changed to patientId
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}> {/* Use value={field.value} */}
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un paciente">
                            {selectedPatient ? `${selectedPatient.name} (RUT: ${selectedPatient.rut})` : "Selecciona un paciente"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}> {/* Use patient.id as value */}
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
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una sala" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UAPORRINO">UAPORRINO</SelectItem>
                        <SelectItem value="RBC">RBC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
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
                              format(parse(field.value, "yyyy-MM-dd", new Date()), "PPP", { locale: es })
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
                          selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              // Explicitly create a local date from components to avoid timezone shifts
                              const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                              field.onChange(format(localDate, "yyyy-MM-dd"));
                            } else {
                              field.onChange("");
                            }
                          }}
                          initialFocus
                          locale={es}
                          defaultMonth={new Date(2025, 0, 1)} // Default to Jan 2025
                          fromYear={2020} // Allow selection from 2020
                          toYear={2030} // Allow selection up to 2030
                          captionLayout="dropdown-buttons" // Enable dropdowns for month/year
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sesión</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Evaluación">Evaluación</SelectItem>
                        <SelectItem value="Intervención">Intervención</SelectItem>
                        <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-semibold mt-4">Observaciones</h3>
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notas adicionales..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 mt-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                    <div className="space-y-0.5">
                      <FormLabel>Sesión Recurrente</FormLabel>
                      <FormDescription>
                        Marca si esta sesión se repite periódicamente.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patrón de Recurrencia</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un patrón" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recurrenceEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Fin de Recurrencia</FormLabel>
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
                                format(parse(field.value, "yyyy-MM-dd", new Date()), "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha de fin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                // Explicitly create a local date from components to avoid timezone shifts
                                const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                field.onChange(format(localDate, "yyyy-MM-dd"));
                              } else {
                                field.onChange("");
                              }
                            }}
                            initialFocus
                            locale={es}
                            defaultMonth={new Date(2025, 0, 1)} // Default to Jan 2025
                            fromYear={2020} // Allow selection from 2020
                            toYear={2030} // Allow selection up to 2030
                            captionLayout="dropdown-buttons" // Enable dropdowns for month/year
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="submit">{initialData && initialData.id ? "Guardar Cambios" : "Programar Sesión"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionForm;