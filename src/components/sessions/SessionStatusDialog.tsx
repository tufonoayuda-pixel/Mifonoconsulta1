"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Session } from "@/types/session";

const statusFormSchema = z.object({
  justificationNotAttended: z.string().optional(), // For 'No Atendida'
  isJustifiedNotAttended: z.boolean().optional(), // For 'No Atendida'
  observationsAttended: z.string().optional(), // For 'Atendida'
  continueSessions: z.boolean().optional(), // For 'Atendida'
});

type StatusFormValues = z.infer<typeof statusFormSchema>;

interface SessionStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: Session, values: StatusFormValues) => void;
  session: Session | null;
  statusType: "Atendida" | "No Atendida";
}

const SessionStatusDialog: React.FC<SessionStatusDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  session,
  statusType,
}) => {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      justificationNotAttended: "",
      isJustifiedNotAttended: false,
      observationsAttended: "",
      continueSessions: true,
    },
  });

  React.useEffect(() => {
    if (session) {
      form.reset({
        justificationNotAttended: statusType === "No Atendida" ? session.justificationNotAttended || "" : "",
        isJustifiedNotAttended: statusType === "No Atendida" ? session.isJustifiedNotAttended || false : false,
        observationsAttended: statusType === "Atendida" ? session.observationsAttended || "" : "",
        continueSessions: statusType === "Atendida" ? session.continueSessions || true : false,
      });
    }
  }, [session, statusType, form]);

  const handleSubmit = (values: StatusFormValues) => {
    if (session) {
      onSubmit(session, values);
      form.reset();
      onClose();
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Marcar Sesión como {statusType}</DialogTitle>
          <DialogDescription>
            Paciente: {session.patientName} - Fecha: {format(new Date(session.date), "PPP", { locale: es })} - Hora: {session.time}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            {statusType === "No Atendida" && (
              <>
                <FormField
                  control={form.control}
                  name="justificationNotAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Justificación de Inasistencia</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Motivo por el cual el paciente no asistió a la sesión." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isJustifiedNotAttended"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          ¿La inasistencia fue justificada?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            {(statusType === "Atendida") && (
              <>
                <FormField
                  control={form.control}
                  name="observationsAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones de la Sesión</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Anotaciones relevantes sobre la sesión atendida." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="continueSessions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          ¿El paciente continuará con sesiones?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter>
              <Button type="submit">Confirmar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionStatusDialog;