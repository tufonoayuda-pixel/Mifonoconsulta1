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
    cell: ({ row }) => row.original.preferredRoom && row.original.preferredRoom !== "Sin preferencia" ? row.original.preferredRoom : "N/A",
  },
  {
    accessorKey: "preferredDay",
    header: "Día Pref.",
    cell: ({ row }) => row.original.preferredDay && row.original.preferredDay !== "Sin preferencia" ? row.original.preferredDay : "N/A",
  },
  {
    accessorKey: "preferredTime",
    header: "Hora Pref.",
    cell: ({ row }) => row.original.preferredTime && row.original.preferredTime !== "" ? row.original.preferredTime : "N/A",
  },
  {
    accessorKey: "serviceType",
    header: "Prestación",
    cell: ({ row }) => row.original.serviceType && row.original.serviceType !== "Sin preferencia" ? row.original.serviceType : "N/A",
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-[150px] block text-muted-foreground text-sm">
        {row.original.observations || "N/A"}
      </span>
    ),
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