"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle2, Circle, Trash2, Edit } from "lucide-react";
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

interface HomeTaskColumnsProps {
  onEdit: (task: HomeTask) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: HomeTask) => void;
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
}: HomeTaskColumnsProps): ColumnDef<HomeTask>[] => [
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
      );
    },
  },
];