"use client";

import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import "react-big-calendar/lib/css/react-big-calendar.css"; // Import default styles

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface SessionCalendarProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

const SessionCalendar: React.FC<SessionCalendarProps> = ({ sessions, onSelectSession }) => {
  const events = sessions.map((session) => {
    const startDateTime = parse(`${session.date} ${session.time}`, "yyyy-MM-dd HH:mm", new Date());
    const endDateTime = new Date(startDateTime.getTime() + session.duration * 60 * 1000); // Add duration in minutes

    return {
      id: session.id,
      title: `${session.patientName} (${session.room}) - ${session.type}`,
      start: startDateTime,
      end: endDateTime,
      allDay: false,
      resource: session, // Store the full session object
    };
  });

  const eventPropGetter = (event: any) => {
    let backgroundColor = "";
    switch (event.resource.status) {
      case "Programada":
        backgroundColor = "#3b82f6"; // blue-500
        break;
      case "Atendida":
        backgroundColor = "#22c55e"; // green-500
        break;
      case "No Atendida":
        backgroundColor = "#ef4444"; // red-500
        break;
      default:
        backgroundColor = "#6b7280"; // gray-500
    }
    return { style: { backgroundColor, borderRadius: '4px', border: 'none' } };
  };

  return (
    <Card className="h-[700px]"> {/* Fixed height for calendar */}
      <CardHeader>
        <CardTitle>Calendario de Sesiones</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-6rem)]"> {/* Adjust content height */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={{
            allDay: "Todo el día",
            previous: "Anterior",
            next: "Siguiente",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay sesiones en este rango.",
            showMore: (total) => `+ Ver más (${total})`,
          }}
          culture="es"
          onSelectEvent={(event) => onSelectSession(event.resource)}
          eventPropGetter={eventPropGetter}
        />
      </CardContent>
    </Card>
  );
};

export default SessionCalendar;