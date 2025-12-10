"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Settings, Users, Calendar, ClipboardList, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { showError, showSuccess } from "@/utils/toast"; // Import showSuccess
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button
import JSZip from "jszip"; // Import JSZip
import { saveAs } from "file-saver"; // Import saveAs
import { format } from "date-fns"; // Import format from date-fns

interface DashboardStats {
  patients: number;
  sessions: number;
  clinical_records: number;
}

const SettingsPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const { count: patientsCount, error: patientsError } = await supabase
        .from("patients")
        .select("count", { count: "exact", head: true });
      if (patientsError) throw patientsError;

      const { count: sessionsCount, error: sessionsError } = await supabase
        .from("sessions")
        .select("count", { count: "exact", head: true });
      if (sessionsError) throw sessionsError;

      const { count: clinicalRecordsCount, error: clinicalRecordsError } = await supabase
        .from("clinical_records") // Corrected table name
        .select("count", { count: "exact", head: true });
      if (clinicalRecordsError) throw clinicalRecordsError;

      return {
        patients: patientsCount || 0,
        sessions: sessionsCount || 0,
        clinical_records: clinicalRecordsCount || 0,
      };
    } catch (error: any) {
      showError("Error al cargar estadísticas: " + error.message);
      throw error;
    }
  };

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery<DashboardStats, Error>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // Refetch every minute
  });

  const exportData = async (tableName: string, displayName: string) => {
    try {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;

      const zip = new JSZip();
      const fileName = `${displayName.toLowerCase().replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
      zip.file(fileName, JSON.stringify(data, null, 2));

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${displayName.toLowerCase().replace(/ /g, '_')}_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.zip`);
      showSuccess(`Datos de ${displayName} exportados exitosamente.`);
    } catch (error: any) {
      showError(`Error al exportar datos de ${displayName}: ` + error.message);
      console.error(`Error exporting ${displayName} data:`, error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Centro de control para aspectos administrativos y de gestión.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta: Estado de Conexión */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Verifica tu conexión a internet. La conexión a Supabase se gestiona automáticamente.
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta: Estadísticas del Sistema */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estadísticas del Sistema</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="text-sm text-muted-foreground">Cargando estadísticas...</div>
            ) : isErrorStats ? (
              <div className="text-sm text-red-500">Error al cargar.</div>
            ) : (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" /> Pacientes:
                  </span>
                  <span className="font-bold">{stats?.patients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-purple-500" /> Sesiones:
                  </span>
                  <span className="font-bold">{stats?.sessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-green-500" /> Registros Clínicos:
                  </span>
                  <span className="font-bold">{stats?.clinical_records}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta: Exportación de Datos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exportación de Datos</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Exporta tus datos de pacientes, sesiones y registros clínicos en formato ZIP.
            </CardDescription>
            <div className="grid gap-2">
              <Button onClick={() => exportData("patients", "Pacientes")}>
                Exportar Pacientes
              </Button>
              <Button onClick={() => exportData("sessions", "Sesiones")}>
                Exportar Sesiones
              </Button>
              <Button onClick={() => exportData("clinical_records", "Registros Clínicos")}>
                Exportar Registros Clínicos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;