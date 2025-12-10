"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MadeWithDyad } from "./made-with-dyad";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { Badge } from "@/components/ui/badge"; // Import Badge component

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchUnreadNotificationsCount = useCallback(async () => {
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          !isMobile && "ml-64", // Adjust margin for desktop when sidebar is always open
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
          <h1 className="text-xl font-semibold">MiFonoConsulta</h1>
          <div className="ml-auto flex items-center gap-4">
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
            {/* Future: Add user menu */}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Layout;