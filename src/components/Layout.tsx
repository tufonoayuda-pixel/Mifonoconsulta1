"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import PersonalFooter from "./PersonalFooter";
import { cn } from "@/lib/utils";
import { supabase, db } from "@/integrations/supabase/client"; // Import both supabase (online) and db (offline) clients
import { Badge } from "@/components/ui/badge";
import SyncStatusIndicator from "./SyncStatusIndicator"; // Import the new component
import { syncService } from "@/services/sync-service"; // Import syncService

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchUnreadNotificationsCount = useCallback(async () => {
    // Use the online client for notifications as they are not typically created offline by the user
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread notifications count in layout:", error);
    } else {
      setUnreadNotificationsCount(count || 0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadNotificationsCount();

    const channel = supabase
      .channel("layout_notifications_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          console.log("Notification change in layout!", payload);
          fetchUnreadNotificationsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadNotificationsCount]);

  // Effect for real-time date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santiago",
      });
      setCurrentDateTime(formatter.format(now));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Initialize sync service
  useEffect(() => {
    if (navigator.onLine) {
      syncService.startSync();
    }
    // The syncService itself listens to online/offline events
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          !isMobile && "ml-64",
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          )}
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">🧠👅</span> MiFonoConsulta
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <SyncStatusIndicator /> {/* Add the sync status indicator here */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentDateTime}
            </span>
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
              </Button>
              {unreadNotificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs animate-bounce"
                >
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
        <PersonalFooter />
      </div>
    </div>
  );
};

export default Layout;