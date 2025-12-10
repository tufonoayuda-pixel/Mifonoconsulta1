"use client";

import React from "react";
import { format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, MapPin, User, Tag } from "lucide-react";

import { Session } from "@/types/session";
import { Patient } from "@/types/patient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DailyAgendaProps {
  sessions: Session[];
  availablePatients: Patient[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSelectSession: (session: Session) => void;
}

const DailyAgenda: React.FC<DailyAgendaProps> = ({
  sessions,
  availablePatients,
  selectedDate,
  onDateChange,
  onSelectSession,
}) => {
  // Formatear selectedDate a 'YYYY-MM-DD' para una comparación directa
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const filteredSessions = sessions
    .filter((session) => session.date === formattedSelectedDate) // Comparación directa de cadenas de fecha
    .sort((a, b) => a.time.localeCompare(b.time)); // Sort by time

  const getSessionBadgeVariant = (status: Session["status"]) => {
    switch (status) {
      case "Programada":
        return "default";
      case "Atendida":
        return "success"; // Assuming you have a 'success' variant for Badge
      case "No Atendida":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Seleccionar Fecha</CardTitle>
          <CardDescription>Elige un día para ver su agenda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
            locale={es}
            className="rounded-md border shadow"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            Agenda para {format(selectedDate, "PPP", { locale: es })}
          </CardTitle>
          <CardDescription>
            {filteredSessions.length > 0
              ? `Tienes ${filteredSessions.length} sesiones programadas.`
              : "No hay sesiones programadas para este día."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)] pr-4">
            <div className="grid gap-4">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="border-l-4 border-primary hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectSession(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {session.patientName}
                        </h4>
                        <Badge variant={getSessionBadgeVariant(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {session.time} ({session.duration} min)
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Sala: {session.room}
                        </p>
                        <p className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Tipo: {session.type}
                        </p>
                        {session.observations && (
                          <p className="mt-2 text-xs italic">
                            Obs: {session.observations}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay sesiones para el día seleccionado.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyAgenda;