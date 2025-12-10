"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Patient } from "@/types/patient";

interface PatientColumnsProps {
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export const createPatientColumns = ({ onEdit, onDelete }: PatientColumnsProps): ColumnDef<Patient>[] => [
  {
    accessorKey: "rut",
    header: "RUT",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "age",
    header: "Edad",
  },
  {
    accessorKey: "preferredRoom",
    header: "Sala Pref.",
  },
  {
    accessorKey: "preferredDay",
    header: "Día Pref.",
  },
  {
    accessorKey: "preferredTime",
    header: "Hora Pref.",
  },
  {
    accessorKey: "serviceType",
    header: "Prestación",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(patient)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(patient.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];