"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle2, Circle, Trash2, Edit, Image as ImageIcon, Printer, FileDown } from "lucide-react"; // Import Printer and FileDown
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HomeTask } from "@/types/home-task";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Import DialogFooter
import React from "react"; // Import React

interface HomeTaskColumnsProps {
  onEdit: (task: HomeTask) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: HomeTask) => void;
  onPrintSingleTask: (task: HomeTask) => void; // New prop for printing a single task
  onSavePdfSingleTask: (task: HomeTask) => void; // New prop for saving a single task as PDF
}

const getStatusBadgeVariant = (status: HomeTask["status"]) => {
  switch (status) {
    case "assigned":
      return "default";
    case "completed":
      return "success";
    default:
      return "secondary";
  }
};

export const createHomeTaskColumns = ({
  onEdit,
  onDelete,
  onToggleStatus,
  onPrintSingleTask, // Destructure new prop
  onSavePdfSingleTask, // Destructure new prop
}: HomeTaskColumnsProps): ColumnDef<HomeTask>[] => {
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);

  const openImageDialog = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  return [
    {
      accessorKey: "title",
      header: "Tarea",
    },
    {
      accessorKey: "patientName",
      header: "Paciente",
    },
    {
      accessorKey: "due_date",
      header: "Fecha Límite",
      cell: ({ row }) => {
        const dueDate = row.getValue("due_date") as string;
        return dueDate ? format(new Date(dueDate), "PPP", { locale: es }) : "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status: HomeTask["status"] = row.getValue("status");
        return <Badge variant={getStatusBadgeVariant(status)}>{status === "assigned" ? "Asignada" : "Completada"}</Badge>;
      },
    },
    {
      accessorKey: "image_url",
      header: "Imagen",
      cell: ({ row }) => {
        const imageUrl = row.getValue("image_url") as string | null;
        if (imageUrl) {
          return (
            <Button variant="outline" size="sm" onClick={() => openImageDialog(imageUrl)}>
              <ImageIcon className="h-4 w-4 mr-1" /> Ver Imagen
            </Button>
          );
        }
        return <span className="text-muted-foreground text-sm">N/A</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Creada",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return format(date, "PPpp", { locale: es });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(task)}>
                  {task.status === "assigned" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como Completada
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-4 w-4" /> Marcar como Asignada
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPrintSingleTask(task)}>
                  <Printer className="mr-2 h-4 w-4" /> Imprimir Tarea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSavePdfSingleTask(task)}>
                  <FileDown className="mr-2 h-4 w-4" /> Guardar Tarea PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(task.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Image Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Imagen de Referencia</DialogTitle>
                </DialogHeader>
                {currentImageUrl && (
                  <img src={currentImageUrl} alt="Referencia de Tarea" className="w-full h-auto object-contain max-h-[70vh]" />
                )}
                <DialogFooter>
                  <Button onClick={() => setIsImageDialogOpen(false)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
  ];
};