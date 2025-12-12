"use client";

import { useEffect, useRef, useCallback } from "react";
import { format, parse, addMinutes, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Session } from "@/types/session";

export const useSessionNotifications = (sessions: Session[]) => {
  const notifiedSessions = useRef(new Set<string>());
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio("/notification.mp3");
  }, []);

  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const createNotification = useCallback(async (type: string, title: string, message: string) => {
    const { error } = await supabase.from("notifications").insert({
      type,
      title,
      message,
      read: false,
      time: format(new Date(), "HH:mm", { locale: es }),
    });
    if (error) {
      console.error("Error creating notification:", error);
    }
  }, []);

  useEffect(() => {
    if (!sessions) return;

    const interval = setInterval(() => {
      const now = new Date();
      sessions.forEach(session => {
        if (session.status === "Programada" && !notifiedSessions.current.has(session.id)) {
          const sessionDateTime = parse(`${session.date} ${session.time}`, "yyyy-MM-dd HH:mm", new Date());
          const tenMinutesBefore = addMinutes(sessionDateTime, -10);

          if (isBefore(tenMinutesBefore, now) && isBefore(now, sessionDateTime)) {
            toast.info(`Recordatorio: La sesión de ${session.patientName} en la sala ${session.room} comienza en menos de 10 minutos.`, {
              duration: 10000,
              action: {
                label: "Ver Sesiones",
                onClick: () => { /* No action needed here, as the user is already on the sessions page */ },
              },
            });
            playNotificationSound();
            createNotification(
              "session_reminder",
              "Recordatorio de Sesión Próxima",
              `La sesión de ${session.patientName} en la sala ${session.room} a las ${session.time} comienza pronto.`
            );
            notifiedSessions.current.add(session.id);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessions, createNotification]);
};