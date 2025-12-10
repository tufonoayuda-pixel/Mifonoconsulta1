"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, FileText, Bell, Circle } from "lucide-react";
import MyScheduleCard from "@/components/MyScheduleCard"; // Import the new component

const Index = () => {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bienvenido a MiFonoConsulta</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
          En vivo
        </div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Tu sistema de gestión integral para fonoaudiólogos. Aquí encontrarás un resumen rápido de tu consulta.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p> {/* Placeholder data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">+5 en las últimas 24 horas</p> {/* Placeholder data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros Clínicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">+15 nuevos esta semana</p> {/* Placeholder data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones Pendientes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">¡Revisa tus alertas!</p> {/* Placeholder data */}
          </CardContent>
        </Card>
      </div>
      {/* Add the MyScheduleCard here */}
      <MyScheduleCard />
      {/* Future: Add more dashboard content here */}
    </div>
  );
};

export default Index;