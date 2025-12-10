"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, FileText, Bell, Circle } from "lucide-react";
import MyScheduleCard from "@/components/MyScheduleCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { showError } from "@/utils/toast";
import { format } from "date-fns";

interface DashboardStats {
  totalPatients: number;
  sessionsToday: number;
  totalClinicalRecords: number;
  pendingNotifications: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const today = format(new Date(), "yyyy-MM-dd");

  try {
    const { count: totalPatients, error: patientsError } = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true });
    if (patientsError) throw patientsError;

    const { count: sessionsToday, error: sessionsError } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("date", today)
      .eq("status", "Programada");
    if (sessionsError) throw sessionsError;

    const { count: totalClinicalRecords, error: clinicalRecordsError } = await supabase
      .from("clinical_records")
      .select("id", { count: "exact", head: true });
    if (clinicalRecordsError) throw clinicalRecordsError;

    const { count: pendingNotifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    if (notificationsError) throw notificationsError;

    return {
      totalPatients: totalPatients || 0,
      sessionsToday: sessionsToday || 0,
      totalClinicalRecords: totalClinicalRecords || 0,
      pendingNotifications: pendingNotifications || 0,
    };
  } catch (error: any) {
    showError("Error al cargar estadísticas del dashboard: " + error.message);
    throw error;
  }
};

const Index = () => {
  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats, Error>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <h1 className="text-3xl font-bold">Bienvenido a MiFonoConsulta</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Cargando tu resumen rápido...
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
                <Circle className="h-4 w-4 text-muted-foreground animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
                <p className="text-xs text-muted-foreground">...</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <MyScheduleCard />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <h1 className="text-3xl font-bold">Bienvenido a MiFonoConsulta</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Hubo un error al cargar las estadísticas: {error?.message}
        </p>
        <MyScheduleCard />
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{stats?.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Datos en tiempo real</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sessionsToday}</div>
            <p className="text-xs text-muted-foreground">Sesiones programadas para hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros Clínicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClinicalRecords}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones Pendientes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingNotifications}</div>
            <p className="text-xs text-muted-foreground">¡Revisa tus alertas!</p>
          </CardContent>
        </Card>
      </div>
      <MyScheduleCard />
    </div>
  );
};

export default Index;