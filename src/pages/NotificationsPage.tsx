"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Bell, Trash2, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase, db } from "@/integrations/supabase/client"; // Import both
import { Notification } from "@/types/notification";
import { showSuccess, showError } from "@/utils/toast";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Helper function to get badge variant based on notification type
const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case "session_reminder":
      return "default";
    case "cancellation":
      return "destructive";
    case "patient_management":
      return "secondary";
    case "clinical_record":
      return "outline";
    default:
      return "default";
  }
};

// Helper function to format date and time for Chile timezone
const formatDateTime = (isoString?: string) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  // Using date-fns format with locale for "dd/MM/yyyy HH:mm hrs"
  return format(date, "dd/MM/yyyy HH:mm 'hrs'", { locale: es });
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkAsRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No hay notificaciones.</p>
    );
  }

  return (
    <ScrollArea className="max-h-[70vh] rounded-md border p-4"> {/* Adjusted height for mobile */}
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={cn(
            "relative",
            notification.read ? "bg-card" : "bg-muted/50 border-primary/50"
          )}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Bell className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    <Badge variant={getNotificationBadgeVariant(notification.type)} className="mr-2">
                      {notification.type.replace(/_/g, ' ')}
                    </Badge>
                    {notification.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="h-8 w-8"
                        title="Marcar como leído"
                      >
                        <MailOpen className="h-4 w-4" />
                        <span className="sr-only">Marcar como leído</span>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar notificación</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu notificación.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(notification.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                  {" - "}
                  <span title={formatDateTime(notification.created_at)}>
                    {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{notification.message}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};


const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    // Notifications are typically online-only, so use the online client
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError("Error al cargar notificaciones: " + error.message);
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data || []);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          console.log("Change received!", payload);
          fetchNotifications(); // Re-fetch notifications on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    // Notifications are typically online-only, so use the online client
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      showError("Error al marcar como leída: " + error.message);
      console.error("Error marking notification as read:", error);
    } else {
      showSuccess("Notificación marcada como leída.");
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      showSuccess("No hay notificaciones sin leer.");
      return;
    }

    // Notifications are typically online-only, so use the online client
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("read", false); // Update all unread notifications

    if (error) {
      showError("Error al marcar todas como leídas: " + error.message);
      console.error("Error marking all notifications as read:", error);
    } else {
      showSuccess("Todas las notificaciones marcadas como leídas.");
      fetchNotifications();
    }
  };

  const handleDeleteNotification = async (id: string) => {
    // Notifications are typically online-only, so use the online client
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      showError("Error al eliminar notificación: " + error.message);
      console.error("Error deleting notification:", error);
    } else {
      showSuccess("Notificación eliminada.");
      fetchNotifications();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Notificaciones</h1>
        <Button onClick={handleMarkAllAsRead} className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Marcar todas como leídas
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Revisa y gestiona todas tus alertas y recordatorios importantes.
      </p>

      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    </div>
  );
};

export default NotificationsPage;