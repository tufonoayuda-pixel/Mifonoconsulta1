"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { syncService } from '@/services/sync-service';
import { cn } from '@/lib/utils';

const SyncStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState(syncService.getStatus());

  useEffect(() => {
    const handleStatusChange = () => {
      setStatus(syncService.getStatus());
    };

    syncService.addSyncStatusListener(handleStatusChange);
    return () => {
      syncService.removeSyncStatusListener(handleStatusChange);
    };
  }, []);

  const { isOnline, isSyncing, pendingOperations, lastSyncError } = status;

  let icon;
  let text;
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
  let tooltipContent;

  if (!isOnline) {
    icon = <WifiOff className="h-4 w-4" />;
    text = 'Offline';
    variant = 'destructive';
    tooltipContent = 'Sin conexión a internet. Los cambios se guardarán localmente.';
  } else if (isSyncing) {
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    text = 'Sincronizando...';
    variant = 'secondary';
    tooltipContent = `Sincronizando ${pendingOperations} cambios pendientes.`;
    if (lastSyncError) {
      icon = <AlertCircle className="h-4 w-4 text-yellow-500" />;
      text = 'Error de Sinc.';
      variant = 'destructive';
      tooltipContent = `Error al sincronizar: ${lastSyncError}. Reintentando...`;
    }
  } else if (pendingOperations > 0) {
    icon = <CloudOff className="h-4 w-4" />;
    text = 'Pendiente';
    variant = 'destructive';
    tooltipContent = `${pendingOperations} cambios pendientes de sincronizar.`;
  } else {
    icon = <CheckCircle2 className="h-4 w-4" />;
    text = 'Online';
    variant = 'success';
    tooltipContent = 'Conectado y sincronizado.';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={cn("flex items-center gap-1 cursor-pointer", {
            "bg-yellow-500 text-white hover:bg-yellow-600": lastSyncError && isOnline,
          })}>
            {icon}
            <span className="hidden sm:inline">{text}</span>
            {pendingOperations > 0 && !isSyncing && isOnline && (
              <span className="ml-1 text-xs font-bold">{pendingOperations}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;