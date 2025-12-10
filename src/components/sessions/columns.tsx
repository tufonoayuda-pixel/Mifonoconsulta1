"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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
import { Session } from "@/types/session";
import { Badge } from "@/components/ui/badge"; // Import Badge

interface SessionColumnsProps {
  onEdit: (session: Session) => void;
  onMarkAttended: (session: Session) => void;
  onMarkNotAttended: (session: Session) => void;
  onDelete: (id: string) => void;
}

const getSessionBadgeVariant = (status: Session["status"]) => {
  switch (status) {
    case "Programada":
      return "default"; // This will map to primary in the new theme
    case "Atendida":
      return "success"; // Use the new 'success' variant
    case "No Atendida":
      return "destructive";
    default:
      return "secondary";
  }
};

export const createSessionColumns = ({
  onEdit,
  onMarkAttended,
  onMarkNotAttended,
  onDelete,
}: SessionColumnsProps): ColumnDef<Session>[] => [
  {
    accessorKey: "patientName",
    header: "Paciente",
  },
  {
    accessorKey: "room",
    header: "Sala",
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return format(date, "PPP", { locale: es });
    },
  },
  {
    accessorKey: "time",
    header: "Hora",
  },
  {
    accessorKey: "duration",
    header: "Duración (min)",
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <Badge variant={getSessionBadgeVariant(session.status)}>
          {session.status}
        </Badge>
      );
    },
  },
  {
    id: "details",
    header: "Detalles",
    cell: ({ row }) => {
      const session = row.original;
      if (session.status === "Atendida" && session.observationsAttended) {
        return <span className="text-sm text-muted-foreground truncate max-w-[150px] block">{session.observationsAttended}</span>;
      }
      if (session.status === "No Atendida" && session.justificationNotAttended) {
        return <span className="text-sm text-muted-foreground truncate max-w-[150px] block">{session.justificationNotAttended}</span>;
      }
      return <span className="text-sm text-muted-foreground">N/A</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(session)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMarkAttended(session)}>
              Marcar como Atendida
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkNotAttended(session)}>
              Marcar como No Atendida
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(session.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];