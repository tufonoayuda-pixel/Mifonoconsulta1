"use client";

import React, { useState } from "react";
import { PlusCircle, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Todo } from "@/types/todo";
import { supabase, db } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import {
  Form, // Import Form component
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "@/components/SessionContextProvider"; // Import useSession

const todoFormSchema = z.object({
  task: z.string().min(1, { message: "La tarea no puede estar vacía." }),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

const TodoPage: React.FC = () => {
  const queryClient = useQueryClient();
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      task: "",
    },
  });
  const { user } = useSession(); // Get the authenticated user

  // Fetch todos
  const { data: todos, isLoading, isError, error } = useQuery<Todo[], Error>({
    queryKey: ["todos", user?.id], // Include user.id in query key
    queryFn: async () => {
      if (!user?.id) return []; // Return empty if no user
      const { data, error } = await supabase.from("todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user?.id, // Only run query if user ID is available
  });

  // Add todo mutation
  const addTodoMutation = useMutation<Todo, Error, TodoFormValues>({
    mutationFn: async (newTodo) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { data, error } = await db.from("todos").insert({ ...newTodo, is_completed: false, user_id: user.id }).select().single();
      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("Tarea añadida exitosamente (o en cola para sincronizar).");
      form.reset();
    },
    onError: (err) => {
      showError("Error al añadir tarea: " + err.message);
    },
  });

  // Update todo mutation (for toggling completion)
  const updateTodoMutation = useMutation<Todo, Error, Todo>({
    mutationFn: async (updatedTodo) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { data, error } = await db.from("todos").update({ is_completed: updatedTodo.is_completed }).match({ id: updatedTodo.id, user_id: user.id }).select().single();
      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("Tarea actualizada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al actualizar tarea: " + err.message);
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { error } = await db.from("todos").delete().match({ id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("Tarea eliminada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar tarea: " + err.message);
    },
  });

  const handleAddTodo = (values: TodoFormValues) => {
    addTodoMutation.mutate(values);
  };

  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({ ...todo, is_completed: !todo.is_completed });
  };

  if (isLoading) return <div className="p-4 text-center">Cargando tareas...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar tareas: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Pendientes</h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Gestiona tus tareas diarias y mantente organizado.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Añadir Nueva Tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTodo)} className="flex gap-2">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Escribe una nueva tarea..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={addTodoMutation.isPending}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
          <CardDescription>Tareas pendientes y completadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-450px)] pr-4">
            <div className="grid gap-3">
              {todos?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay tareas pendientes.</p>
              ) : (
                todos?.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-md",
                      todo.is_completed ? "bg-muted/50 line-through text-muted-foreground" : "bg-card"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={todo.is_completed}
                        onCheckedChange={() => handleToggleComplete(todo)}
                        id={`todo-${todo.id}`}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {todo.task}
                      </label>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar tarea</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu tarea.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTodoMutation.mutate(todo.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoPage;