"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table"; // Reusing patient data-table for now
import { createHomeTaskColumns } from "@/components/home-tasks/columns";
import HomeTaskForm from "@/components/home-tasks/HomeTaskForm";
import { HomeTask } from "@/types/home-task";
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/components/SessionContextProvider";

const HomeTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HomeTask | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const { user } = useSession();

  // Fetch patients for the dropdown
  const { data: availablePatients, isLoading: isLoadingPatients, isError: isErrorPatients, error: errorPatients } = useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data as Patient[];
    },
  });

  // Fetch home tasks
  const { data: homeTasks, isLoading: isLoadingTasks, isError: isErrorTasks, error: errorTasks } = useQuery<HomeTask[], Error>({
    queryKey: ["homeTasks", user?.id, availablePatients],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("home_tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;

      return data.map(task => ({
        ...task,
        patientName: availablePatients?.find(p => p.id === task.patient_id)?.name || "Desconocido",
      })) as HomeTask[];
    },
    enabled: !!user?.id && !!availablePatients,
  });

  // Mutation for adding a home task
  const addTaskMutation = useMutation<HomeTask, Error, HomeTask>({
    mutationFn: async (newTask) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const payload = {
        user_id: user.id,
        patient_id: newTask.patient_id,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        status: newTask.status,
      };
      const { data, error } = await db.from("home_tasks").insert(payload);
      if (error) throw error;
      return data as HomeTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeTasks"] });
      showSuccess("Tarea para casa asignada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al asignar tarea para casa: " + err.message);
    },
  });

  // Mutation for updating a home task
  const updateTaskMutation = useMutation<HomeTask, Error, HomeTask>({
    mutationFn: async (updatedTask) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const payload = {
        patient_id: updatedTask.patient_id,
        title: updatedTask.title,
        description: updatedTask.description,
        due_date: updatedTask.due_date,
        status: updatedTask.status,
      };
      const { data, error } = await db.from("home_tasks").update(payload).match({ id: updatedTask.id, user_id: user.id });
      if (error) throw error;
      return data as HomeTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeTasks"] });
      showSuccess("Tarea para casa actualizada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al actualizar tarea para casa: " + err.message);
    },
  });

  // Mutation for deleting a home task
  const deleteTaskMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      const { error } = await db.from("home_tasks").delete().match({ id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeTasks"] });
      showSuccess("Tarea para casa eliminada exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar tarea para casa: " + err.message);
    },
  });

  const handleAddTask = (newTask: HomeTask) => {
    addTaskMutation.mutate(newTask);
  };

  const handleEditTask = (updatedTask: HomeTask) => {
    updateTaskMutation.mutate(updatedTask);
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleToggleStatus = (task: HomeTask) => {
    const newStatus = task.status === "assigned" ? "completed" : "assigned";
    updateTaskMutation.mutate({ ...task, status: newStatus });
  };

  const openAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: HomeTask) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = useMemo(() => {
    let filtered = homeTasks || [];

    if (currentTab !== "all") {
      filtered = filtered.filter((task) => task.status === currentTab);
    }

    if (globalFilter) {
      const lowerCaseFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerCaseFilter) ||
          task.description?.toLowerCase().includes(lowerCaseFilter) ||
          task.patientName?.toLowerCase().includes(lowerCaseFilter)
      );
    }
    return filtered;
  }, [homeTasks, currentTab, globalFilter]);

  const columns = createHomeTaskColumns({
    onEdit: openEditForm,
    onDelete: handleDeleteTask,
    onToggleStatus: handleToggleStatus,
  });

  if (isLoadingPatients || isLoadingTasks) return <div className="p-4 text-center">Cargando tareas para casa...</div>;
  if (isErrorPatients) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {errorPatients?.message}</div>;
  if (isErrorTasks) return <div className="p-4 text-center text-red-500">Error al cargar tareas: {errorTasks?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tareas para Casa</h1>
        <Button onClick={openAddForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Asignar Tarea
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Asigna y gestiona las tareas que tus pacientes deben realizar en casa.
      </p>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas por título, descripción o paciente..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="assigned">Asignadas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>
        <TabsContent value={currentTab}>
          <DataTable
            columns={columns}
            data={filteredTasks}
            searchPlaceholder="Buscar tareas..." // This is overridden by globalFilter input
            searchColumn="title" // This is not used with globalFilter
          />
        </TabsContent>
      </Tabs>

      <HomeTaskForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        initialData={editingTask}
        availablePatients={availablePatients || []}
      />
    </div>
  );
};

export default HomeTasksPage;