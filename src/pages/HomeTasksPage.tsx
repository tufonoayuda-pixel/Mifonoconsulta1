"use client";

import React, { useState, useMemo, useRef, useEffect } from "react"; // Import useEffect
import { PlusCircle, Search, Printer, FileDown } from "lucide-react";
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
import { useReactToPrint } from "react-to-print"; // Import react-to-print
import jsPDF from "jspdf"; // Import jspdf
import html2canvas from "html2canvas"; // Import html2canvas
import { format } from "date-fns";
import { es } from "date-fns/locale";

const HomeTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HomeTask | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const { user } = useSession();
  const componentRef = useRef<HTMLDivElement>(null); // Ref for the printable component (all tasks)
  const singleTaskPrintRef = useRef<HTMLDivElement>(null); // New ref for single task printing
  const [taskToPrint, setTaskToPrint] = useState<HomeTask | null>(null); // State to hold the single task to print
  const [triggerSinglePrint, setTriggerSinglePrint] = useState(false); // New state to trigger print
  const [triggerSinglePdf, setTriggerSinglePdf] = useState(false); // New state to trigger PDF

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
        image_url: newTask.image_url, // Include new fields
        image_path: newTask.image_path, // Include new fields
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
        image_url: updatedTask.image_url, // Include new fields
        image_path: updatedTask.image_path, // Include new fields
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

      // Fetch the task to get image_path if it exists
      const { data: taskToDelete, error: fetchError } = await supabase.from("home_tasks").select("image_path").eq("id", id).single();
      if (fetchError) throw fetchError;

      // Delete image from storage if it exists
      if (taskToDelete?.image_path) {
        const { error: storageError } = await supabase.onlineClient.storage.from("home-task-images").remove([taskToDelete.image_path]);
        if (storageError) console.error("Error deleting image from storage:", storageError);
      }

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

  const handlePrintAll = useReactToPrint({
    content: () => {
      if (filteredTasks.length === 0) {
        showError("No hay tareas para imprimir en la vista actual.");
        return null; // Prevent printing empty content
      }
      return componentRef.current;
    },
    documentTitle: `Tareas_para_Casa_${format(new Date(), "yyyyMMdd_HHmmss")}`,
    pageStyle: `
      @page {
        size: Letter; /* Standard Letter size */
        margin: 2.5cm; /* 2.5 cm on all sides */
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: Arial, sans-serif !important; /* Recommended sans-serif font */
        font-size: 12pt !important; /* Main body font size */
        color: black !important; /* High contrast */
        line-height: 1.5 !important; /* 1.5 line spacing */
      }
      /* Hide elements with 'no-print' class */
      .no-print {
        display: none !important;
      }
      /* Show the printable content and force black text */
      #printable-content {
        display: block !important;
        color: black !important; /* Force black text for printing */
        font-family: Arial, sans-serif !important; /* Ensure font for printing */
        font-size: 12pt !important; /* Ensure font size for printing */
        line-height: 1.5 !important;
      }
      #printable-content * {
        color: black !important; /* Force black text for all children */
        font-family: Arial, sans-serif !important; /* Ensure font for all children */
        line-height: 1.5 !important;
      }
      #printable-content h1 {
        font-size: 16pt !important; /* Titles 14-16pt */
        font-weight: bold !important;
        color: black !important;
      }
      #printable-content h2 {
        font-size: 14pt !important; /* Titles 14-16pt */
        font-weight: bold !important;
        color: black !important;
      }
      #printable-content p {
        font-size: 12pt !important;
        color: black !important;
        line-height: 1.5 !important;
      }
      #printable-content .text-xs { /* For smaller text like dates */
        font-size: 11pt !important; /* Instructions/clarifications 11-12pt */
        font-style: italic !important;
        color: #333 !important; /* Darker grey for instructions */
      }
      .printable-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .printable-table th, .printable-table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
        color: black !important; /* Ensure table text is black */
        font-size: 12pt !important;
        line-height: 1.5 !important;
      }
      .printable-table th {
        background-color: #f2f2f2;
        font-weight: bold !important;
      }
      .task-image {
        max-width: 150px; /* Adjusted for better print layout */
        max-height: 150px;
        object-fit: contain;
        margin-top: 10px;
      }
    `,
  });

  const handleSaveAllPdf = async () => {
    if (filteredTasks.length === 0) {
      showError("No hay tareas para exportar a PDF en la vista actual.");
      return;
    }

    if (componentRef.current) {
      const printableElement = componentRef.current;
      const originalDisplay = printableElement.style.display;
      const originalColor = printableElement.style.color;
      const originalFontFamily = printableElement.style.fontFamily;
      const originalFontSize = printableElement.style.fontSize;
      const originalLineHeight = printableElement.style.lineHeight;
      const originalPadding = printableElement.style.padding;
      const originalWidth = printableElement.style.width;

      // Temporarily apply print styles for html2canvas capture
      printableElement.style.display = 'block';
      printableElement.style.color = 'black';
      printableElement.style.fontFamily = 'Arial, sans-serif';
      printableElement.style.fontSize = '12pt';
      printableElement.style.lineHeight = '1.5';
      printableElement.style.padding = '2.5cm'; // Simulate margins
      printableElement.style.width = '21.6cm'; // Letter width

      try {
        const canvas = await html2canvas(printableElement, {
          scale: 2, // Increase scale for better resolution
          useCORS: true, // Important for images from external URLs
        });

        if (!canvas) {
          throw new Error("Failed to generate canvas from printable content.");
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (!imgData || imgData.length < 100) {
          throw new Error("Generated image data is empty or invalid.");
        }

        const pdf = new jsPDF('p', 'mm', 'letter'); // Set page format to 'letter'
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(`Tareas_para_Casa_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
        showSuccess("Tareas exportadas a PDF exitosamente.");
      } catch (error: any) {
        showError("Error al exportar a PDF: " + error.message);
        console.error("Error generating PDF:", error);
      } finally {
        // Restore original styles
        printableElement.style.display = originalDisplay;
        printableElement.style.color = originalColor;
        printableElement.style.fontFamily = originalFontFamily;
        printableElement.style.fontSize = originalFontSize;
        printableElement.style.lineHeight = originalLineHeight;
        printableElement.style.padding = originalPadding;
        printableElement.style.width = originalWidth;
      }
    } else {
      showError("No hay contenido para exportar a PDF.");
    }
  };

  // --- Single Task Print/PDF Functions ---
  const triggerPrint = useReactToPrint({
    content: () => {
      if (!taskToPrint) {
        showError("No hay tarea seleccionada para imprimir.");
        return null;
      }
      return singleTaskPrintRef.current;
    },
    documentTitle: `Tarea_${taskToPrint?.title.replace(/\s/g, '_')}_${format(new Date(), "yyyyMMdd_HHmmss")}`,
    pageStyle: `
      @page {
        size: Letter; /* Standard Letter size */
        margin: 2.5cm; /* 2.5 cm on all sides */
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: Arial, sans-serif !important; /* Recommended sans-serif font */
        font-size: 12pt !important; /* Main body font size */
        color: black !important; /* High contrast */
        line-height: 1.5 !important; /* 1.5 line spacing */
      }
      #single-task-printable-content {
        display: block !important;
        color: black !important; /* Force black text for printing */
        font-family: Arial, sans-serif !important; /* Ensure font for printing */
        font-size: 12pt !important; /* Ensure font size for printing */
        line-height: 1.5 !important;
      }
      #single-task-printable-content * {
        color: black !important; /* Force black text for all children */
        font-family: Arial, sans-serif !important; /* Ensure font for all children */
        line-height: 1.5 !important;
      }
      #single-task-printable-content h1 {
        font-size: 16pt !important; /* Titles 14-16pt */
        font-weight: bold !important;
        color: black !important;
      }
      #single-task-printable-content h2 {
        font-size: 14pt !important; /* Titles 14-16pt */
        font-weight: bold !important;
        color: black !important;
      }
      #single-task-printable-content p {
        font-size: 12pt !important;
        color: black !important;
        line-height: 1.5 !important;
      }
      #single-task-printable-content .text-xs { /* For smaller text like dates */
        font-size: 11pt !important; /* Instructions/clarifications 11-12pt */
        font-style: italic !important;
        color: #333 !important; /* Darker grey for instructions */
      }
      .printable-task-card {
        border: 1px solid #ccc;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 8px;
      }
      .task-image {
        max-width: 200px;
        max-height: 200px;
        object-fit: contain;
        margin-top: 10px;
      }
    `,
    onBeforeGetContent: async () => {
      if (!taskToPrint) {
        showError("No hay tarea seleccionada para imprimir.");
        return Promise.reject("No task selected");
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setTaskToPrint(null); // Clear the task after printing
      setTriggerSinglePrint(false); // Reset trigger
    }
  });

  const handlePrintSingleTask = (task: HomeTask) => {
    setTaskToPrint(task);
    setTriggerSinglePrint(true); // Set trigger to true
  };

  useEffect(() => {
    if (triggerSinglePrint && taskToPrint) {
      triggerPrint();
    }
  }, [triggerSinglePrint, taskToPrint, triggerPrint]);


  const handleSavePdfSingleTask = async (task: HomeTask) => {
    setTaskToPrint(task); // Set the task to be rendered in the hidden div
    setTriggerSinglePdf(true); // Set trigger to true
  };

  useEffect(() => {
    const generatePdf = async () => {
      if (triggerSinglePdf && singleTaskPrintRef.current && taskToPrint) {
        const printableElement = singleTaskPrintRef.current;
        const originalDisplay = printableElement.style.display;
        const originalColor = printableElement.style.color;
        const originalFontFamily = printableElement.style.fontFamily;
        const originalFontSize = printableElement.style.fontSize;
        const originalLineHeight = printableElement.style.lineHeight;
        const originalPadding = printableElement.style.padding;
        const originalWidth = printableElement.style.width;

        // Temporarily apply print styles for html2canvas capture
        printableElement.style.display = 'block';
        printableElement.style.color = 'black';
        printableElement.style.fontFamily = 'Arial, sans-serif';
        printableElement.style.fontSize = '12pt';
        printableElement.style.lineHeight = '1.5';
        printableElement.style.padding = '2.5cm'; // Simulate margins
        printableElement.style.width = '21.6cm'; // Letter width

        try {
          const canvas = await html2canvas(printableElement, {
            scale: 2,
            useCORS: true,
          });

          if (!canvas) {
            throw new Error("Failed to generate canvas from printable content.");
          }

          const imgData = canvas.toDataURL('image/jpeg', 0.9);

          if (!imgData || imgData.length < 100) {
            throw new Error("Generated image data is empty or invalid.");
          }

          const pdf = new jsPDF('p', 'mm', 'letter'); // Set page format to 'letter'
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          pdf.save(`Tarea_${taskToPrint.title.replace(/\s/g, '_')}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
          showSuccess("Tarea exportada a PDF exitosamente.");
        } catch (error: any) {
          showError("Error al exportar a PDF: " + error.message);
          console.error("Error generating PDF:", error);
        } finally {
          // Restore original styles
          printableElement.style.display = originalDisplay;
          printableElement.style.color = originalColor;
          printableElement.style.fontFamily = originalFontFamily;
          printableElement.style.fontSize = originalFontSize;
          printableElement.style.lineHeight = originalLineHeight;
          printableElement.style.padding = originalPadding;
          printableElement.style.width = originalWidth;
          setTaskToPrint(null); // Clear the task after processing
          setTriggerSinglePdf(false); // Reset trigger
        }
      } else if (triggerSinglePdf && !singleTaskPrintRef.current) {
        showError("No hay contenido para exportar a PDF.");
        setTaskToPrint(null);
        setTriggerSinglePdf(false);
      }
    };

    if (triggerSinglePdf) {
      // Small delay to ensure DOM update after setTaskToPrint
      const timer = setTimeout(generatePdf, 50); 
      return () => clearTimeout(timer);
    }
  }, [triggerSinglePdf, taskToPrint, singleTaskPrintRef]);


  const columns = createHomeTaskColumns({
    onEdit: openEditForm,
    onDelete: handleDeleteTask,
    onToggleStatus: handleToggleStatus,
    onPrintSingleTask: handlePrintSingleTask,
    onSavePdfSingleTask: handleSavePdfSingleTask,
  });

  if (isLoadingPatients || isLoadingTasks) return <div className="p-4 text-center">Cargando tareas para casa...</div>;
  if (isErrorPatients) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {errorPatients?.message}</div>;
  if (isErrorTasks) return <div className="p-4 text-center text-red-500">Error al cargar tareas: {errorTasks?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-3xl font-bold">Tareas para Casa</h1>
        <div className="flex gap-2">
          <Button onClick={openAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" /> Asignar Tarea
          </Button>
          <Button onClick={handlePrintAll} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Todas
          </Button>
          <Button onClick={handleSaveAllPdf} variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Guardar Todas PDF
          </Button>
        </div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 no-print">
        Asigna y gestiona las tareas que tus pacientes deben realizar en casa.
      </p>

      <div className="flex items-center py-4 no-print">
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

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full no-print">
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

      {/* Printable content for ALL tasks (hidden by default) */}
      <div ref={componentRef} id="printable-content" className="p-4 hidden">
        <h1 className="text-2xl font-bold mb-2">Tareas para Casa</h1>
        <p className="text-lg mb-1">Flgo. Cristobal San Martin</p>
        <p className="text-md mb-4">CESFAM el Barrero</p>
        <p className="text-md mb-4">Fecha de Impresión: {format(new Date(), "PPP", { locale: es })}</p>
        <table className="printable-table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Paciente</th>
              <th>Fecha Límite</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Imagen</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.patientName}</td>
                <td>{task.due_date ? format(new Date(task.due_date), "PPP", { locale: es }) : "N/A"}</td>
                <td>{task.status === "assigned" ? "Asignada" : "Completada"}</td>
                <td>{task.description || "N/A"}</td>
                <td>
                  {task.image_url && (
                    <img src={task.image_url} alt="Referencia" className="task-image" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable content for a SINGLE task (hidden by default) */}
      <div ref={singleTaskPrintRef} id="single-task-printable-content" className="p-4 hidden">
        {taskToPrint && (
          <div className="printable-task-card">
            <h1 className="text-2xl font-bold mb-2">Tarea para Casa</h1>
            <p className="text-lg mb-1">Flgo. Cristobal San Martin</p>
            <p className="text-md mb-4">CESFAM el Barrero</p>
            <p className="text-md mb-4">Fecha de Impresión: {format(new Date(), "PPP", { locale: es })}</p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Título: {taskToPrint.title}</h2>
            <p className="text-lg mb-2">Paciente: {taskToPrint.patientName}</p>
            <p className="text-md mb-2">Fecha Límite: {taskToPrint.due_date ? format(new Date(taskToPrint.due_date), "PPP", { locale: es }) : "N/A"}</p>
            <p className="text-md mb-2">Estado: {taskToPrint.status === "assigned" ? "Asignada" : "Completada"}</p>
            <p className="text-md mt-4">Descripción:</p>
            <p className="text-base">{taskToPrint.description || "Sin descripción."}</p>
            {taskToPrint.image_url && (
              <>
                <p className="text-md mt-4">Imagen de Referencia:</p>
                <img src={taskToPrint.image_url} alt="Referencia de Tarea" className="task-image" />
              </>
            )}
          </div>
        )}
      </div>

      <HomeTaskForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        initialData={editingTask}
        availablePatients={availablePatients || []}
        isSubmitting={addTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  );
};

export default HomeTasksPage;