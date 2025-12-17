"use client";

import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
  Book,
  Settings,
  X,
  ClipboardList, // Icon for Todos
  NotebookPen, // Icon for Notes
  CalendarCheck, // Icon for Weekly Planner
  LibraryBig, // Icon for Study Materials
  LogOut, // Icon for Logout
  Home, // Icon for Home Tasks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client"; // Use online client for notifications and logout
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { useSession } from "@/components/SessionContextProvider"; // Import useSession

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Pacientes",
    icon: Users,
    path: "/patients",
  },
  {
    name: "Sesiones",
    icon: Calendar,
    path: "/sessions",
  },
  {
    name: "Registros Clínicos",
    icon: FileText,
    path: "/records",
  },
  {
    name: "Planificador Semanal",
    icon: CalendarCheck,
    path: "/weekly-planner",
  },
  {
    name: "Tareas para Casa", // New item
    icon: Home,
    path: "/home-tasks",
  },
  {
    name: "Notas",
    icon: NotebookPen,
    path: "/notes",
  },
  {
    name: "Pendientes",
    icon: ClipboardList,
    path: "/todos",
  },
  {
    name: "Material de Estudio",
    icon: LibraryBig,
    path: "/study-materials",
  },
  {
    name: "Notificaciones",
    icon: Bell,
    path: "/notifications",
  },
  {
    name: "Protocolos",
    icon: Book,
    path: "/protocols",
  },
  {
    name: "Configuración",
    icon: Settings,
    path: "/settings",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { user } = useSession(); // Get the authenticated user

  const fetchUnreadNotificationsCount = useCallback(async () => {
    // Use the online client for notifications as they are not typically created offline by the user
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread notifications count:", error);
    } else {
      setUnreadNotificationsCount(count || 0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadNotificationsCount();

    const channel = supabase
      .channel("sidebar_notifications_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          console.log("Notification change in sidebar!", payload);
          fetchUnreadNotificationsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadNotificationsCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose(); // Close sidebar after logout
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300 ease-in-out",
          isMobile && (isOpen ? "translate-x-0" : "-translate-x-full"),
          !isMobile && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <h2 className="text-xl font-semibold text-sidebar-primary-foreground">
            MiFonoConsulta
          </h2>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <nav className="grid items-start gap-2 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )
                }
                onClick={isMobile ? onClose : undefined}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.name === "Notificaciones" && unreadNotificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full animate-bounce"
                  >
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </NavLink>
            ))}
            {user && (
              <Button
                variant="ghost"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-destructive hover:text-destructive-foreground mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </Button>
            )}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;