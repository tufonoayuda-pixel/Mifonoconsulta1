"use client";

import React, { useState } from "react";
import { PlusCircle, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Note } from "@/types/note";
import { supabase, db } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/components/SessionContextProvider"; // Import useSession

const noteFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "El título es obligatorio." }),
  content: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { user } = useSession(); // Get the authenticated user

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Fetch notes
  const { data: notes, isLoading, isError, error } = useQuery<Note[], Error>({
    queryKey: ["notes", user?.id], // Include user.id in query key
    queryFn: async () => {
      if (!user?.id) return []; // Return empty if no user
      const { data, error } = await supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user?.id, // Only run query if user ID is available
  });

  // Add note mutation
  const addNoteMutation = useMutation<Note, Error, NoteFormValues>({
    mutationFn: async (newNote) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { data, error } = await db.from("notes").insert({ ...newNote, user_id: user.id }); // Removed .select().single()
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showSuccess("Nota añadida exitosamente (o en cola para sincronizar).");
      form.reset();
      setIsFormOpen(false);
    },
    onError: (err) => {
      showError("Error al añadir nota: " + err.message);
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation<Note, Error, NoteFormValues>({
    mutationFn: async (updatedNote) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { data, error } = await db.from("notes").update(updatedNote).match({ id: updatedNote.id, user_id: user.id }); // Removed .select().single()
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showSuccess("Nota actualizada exitosamente (o en cola para sincronizar).");
      form.reset();
      setIsFormOpen(false);
      setEditingNote(null);
    },
    onError: (err) => {
      showError("Error al actualizar nota: " + err.message);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { error } = await db.from("notes").delete().match({ id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showSuccess("Nota eliminada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar nota: " + err.message);
    },
  });

  const openAddForm = () => {
    setEditingNote(null);
    form.reset({ title: "", content: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (note: Note) => {
    setEditingNote(note);
    form.reset({ id: note.id, title: note.title, content: note.content || "" }); // Ensure content is string
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: NoteFormValues) => {
    if (editingNote) {
      updateNoteMutation.mutate(values);
    } else {
      addNoteMutation.mutate(values);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Cargando notas...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar notas: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Notas</h1>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Nueva Nota
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Organiza tus pensamientos, ideas y recordatorios importantes.
      </p>

      <ScrollArea className="max-h-[70vh] rounded-md border p-4"> {/* Adjusted height for mobile */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-xl font-semibold">No hay notas creadas aún.</p>
              <p className="text-sm">Haz clic en "Nueva Nota" para empezar a organizar tus ideas.</p>
            </div>
          ) : (
            notes?.map((note) => (
              <Card key={note.id} className="relative border-l-4 border-primary hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-2 text-lg flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <CardTitle className="text-lg font-semibold truncate">
                      {note.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(note)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar nota</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar nota</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu nota.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteNoteMutation.mutate(note.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardDescription className="text-xs text-muted-foreground px-6">
                  Última actualización: {note.updated_at ? format(new Date(note.updated_at), "PPP HH:mm", { locale: es }) : "N/A"}
                </CardDescription>
                <CardContent className="pt-2 px-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 mb-4">
                    {note.content || "Sin contenido."}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Editar Nota" : "Nueva Nota"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la nota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Escribe tu nota aquí..." rows={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={addNoteMutation.isPending || updateNoteMutation.isPending}>
                  {addNoteMutation.isPending || updateNoteMutation.isPending ? "Guardando..." : "Guardar Nota"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;