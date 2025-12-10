"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText, Pencil, Trash2 } from "lucide-react";
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
import { ClinicalRecord, ClinicalRecordType } from "@/types/clinical-record";

interface ClinicalRecordColumnsProps {
  onEdit: (record: ClinicalRecord) => void;
  onDelete: (id: string) => void;
  onViewAttachments: (attachments: { name: string; url: string; type: string }[]) => void;
}

const getBadgeVariant = (type: ClinicalRecordType) => {
  switch (type) {
    case "Evaluación":
      return "default";
    case "Plan de Intervención":
      return "secondary";
    case "Registro de Sesión":
      return "outline";
    default:
      return "default";
  }
};

export const createClinicalRecordColumns = ({
  onEdit,
  onDelete,
  onViewAttachments,
}: ClinicalRecordColumnsProps): ColumnDef<ClinicalRecord>[] => [
  {
    accessorKey: "patientName",
    header: "Paciente",
  },
  {
    accessorKey: "recordType",
    header: "Tipo",
    cell: ({ row }) => {
      const type: ClinicalRecordType = row.getValue("recordType");
      return <Badge variant={getBadgeVariant(type)}>{type}</Badge>;
    },
  },
  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "recordDate",
    header: "Fecha Registro",
    cell: ({ row }) => {
      const date = new Date(row.getValue("recordDate"));
      return format(date, "PPP", { locale: es });
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return format(date, "PPpp", { locale: es });
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Actualizado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return format(date, "PPpp", { locale: es });
    },
  },
  {
    id: "attachments",
    header: "Adjuntos",
    cell: ({ row }) => {
      const attachments = row.original.attachments || [];
      if (attachments.length === 0) {
        return <span className="text-muted-foreground text-sm">Ninguno</span>;
      }
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewAttachments(attachments)}
          className="flex items-center gap-1"
        >
          <FileText className="h-4 w-4" /> {attachments.length}
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(record)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(record.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];