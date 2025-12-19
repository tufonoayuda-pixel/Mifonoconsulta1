"use client";

import React, { useState } from "react";
import { PlusCircle, CalendarDays, MapPin, Clock, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  FormDescription, // Added FormDescription here
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Schedule } from "@/types/schedule";
import { supabase, db } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { getAvailableRooms } from "@/utils/schedule"; // Reutilizar para obtener salas

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const scheduleFormSchema = z.object({
  id: z.string().optional(),
  room: z.string().min(1, { message: "La sala es obligatoria." }),
  day_of_week: z.coerce.number().min(0).max(6, { message: "Día de la semana inválido." }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato de hora de inicio inválido (HH:MM)." }),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato de hora de fin inválido (HH:MM)." }),
  is_active: z.boolean().default(true),
}).refine((data) => {
  const startTime = parse(data.start_time, "HH:mm", new Date());
  const endTime = parse(data.end_time, "HH:mm", new Date());
  return endTime > startTime;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio.",
  path: ["end_time"],
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const WeeklyPlanner: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      room: "",
      day_of_week: 1, // Default to Monday
      start_time: "09:00",
      end_time: "17:00",
      is_active: true,
    },
  });

  // Fetch schedules
  const { data: schedules, isLoading, isError, error } = useQuery<Schedule[], Error>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedules").select("*").order("day_of_week", { ascending: true }).order("start_time", { ascending: true });
      if (error) throw error;
      return data as Schedule[];
    },
  });

  // Add schedule mutation
  const addScheduleMutation = useMutation<Schedule, Error, ScheduleFormValues>({
    mutationFn: async (newSchedule) => {
      const { data, error } = await db.from("schedules").insert(newSchedule).select().single();
      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      showSuccess("Horario añadido exitosamente (o en cola para sincronizar).");
      form.reset();
      setIsFormOpen(false);
    },
    onError: (err) => {
      showError("Error al añadir horario: " + err.message);
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation<Schedule, Error, ScheduleFormValues>({
    mutationFn: async (updatedSchedule) => {
      const { data, error } = await db.from("schedules").update(updatedSchedule).match({ id: updatedSchedule.id }).select().single();
      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      showSuccess("Horario actualizado exitosamente (o en cola para sincronizar).");
      form.reset();
      setIsFormOpen(false);
      setEditingSchedule(null);
    },
    onError: (err) => {
      showError("Error al actualizar horario: " + err.message);
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await db.from("schedules").delete().match({ id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      showSuccess("Horario eliminado exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar horario: " + err.message);
    },
  });

  const openAddForm = () => {
    setEditingSchedule(null);
    form.reset({
      room: "",
      day_of_week: 1,
      start_time: "09:00",
      end_time: "17:00",
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.reset({
      id: schedule.id,
      room: schedule.room,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time.substring(0, 5), // Format to HH:MM
      end_time: schedule.end_time.substring(0, 5),     // Format to HH:MM
      is_active: schedule.is_active,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: ScheduleFormValues) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate(values);
    } else {
      addScheduleMutation.mutate(values);
    }
  };

  const availableRooms = getAvailableRooms();

  if (isLoading) return <div className="p-4 text-center">Cargando planificador semanal...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar planificador: {error?.message}</div>;

  const groupedSchedules = schedules?.reduce((acc, schedule) => {
    const dayName = dayNames[schedule.day_of_week];
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>) || {};

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planificador Semanal</h1>
        <Button onClick={openAddForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Horario
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Gestiona tus horarios de atención y disponibilidad semanal.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dayNames.map((dayName, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                {dayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {groupedSchedules[dayName]?.length === 0 || !groupedSchedules[dayName] ? (
                  <p className="text-sm text-muted-foreground">No hay horarios definidos para este día.</p>
                ) : (
                  groupedSchedules[dayName].map((schedule) => (
                    <div key={schedule.id} className={cn(
                      "flex items-center justify-between p-3 border rounded-md",
                      schedule.is_active ? "bg-card" : "bg-muted/50 text-muted-foreground line-through"
                    )}>
                      <div className="flex flex-col gap-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-primary" /> {schedule.room}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" /> {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(schedule)} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar horario</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar horario</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente este horario.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteScheduleMutation.mutate(schedule.id)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Editar Horario" : "Añadir Nuevo Horario"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una sala" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room} value={room}>{room}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día de la Semana</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Activo</FormLabel>
                      <FormDescription>
                        Define si este horario está actualmente activo.
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
              <DialogFooter>
                <Button type="submit" disabled={addScheduleMutation.isPending || updateScheduleMutation.isPending}>
                  {addScheduleMutation.isPending || updateScheduleMutation.isPending ? "Guardando..." : "Guardar Horario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyPlanner;