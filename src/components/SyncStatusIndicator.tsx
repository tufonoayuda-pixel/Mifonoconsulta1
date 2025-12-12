"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { syncService } from '@/services/sync-service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    tooltipContent = 'Sin conexión a internet. Los cambios se guardarán localmente y se sincronizarán al reconectar.';
  } else if (isSyncing) {
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    text = 'Sincronizando...';
    variant = 'secondary';
    tooltipContent = `Sincronizando ${pendingOperations} cambios pendientes.`;
    if (lastSyncError) {
      icon = <AlertCircle className="h-4 w-4 text-yellow-500" />;
      text = 'Error de Sinc.';
      variant = 'destructive'; // Use destructive for error, but with yellow icon
      tooltipContent = `Error al sincronizar: ${lastSyncError}. Reintentando...`;
    }
  } else if (pendingOperations > 0) {
    icon = <CloudOff className="h-4 w-4" />;
    text = 'Pendiente';
    variant = 'destructive';
    tooltipContent = `${pendingOperations} cambios pendientes de sincronizar. Haz clic para forzar la sincronización.`;
  } else {
    icon = <CheckCircle2 className="h-4 w-4" />;
    text = 'Online';
    variant = 'success';
    tooltipContent = 'Conectado y sincronizado. Todos los cambios están guardados en la nube.';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex items-center gap-1 cursor-pointer", {
              "bg-destructive text-destructive-foreground hover:bg-destructive/90": !isOnline || pendingOperations > 0,
              "bg-success text-success-foreground hover:bg-success/90": isOnline && !isSyncing && pendingOperations === 0,
              "bg-secondary text-secondary-foreground hover:bg-secondary/90": isSyncing && !lastSyncError,
              "bg-yellow-500 text-white hover:bg-yellow-600": lastSyncError && isOnline,
            })}
            onClick={() => {
              if (isOnline && (pendingOperations > 0 || lastSyncError)) {
                syncService.forceSync();
              }
            }}
            disabled={!isOnline && pendingOperations === 0} // Disable if offline and nothing to sync
          >
            {icon}
            <span className="hidden sm:inline">{text}</span>
            {pendingOperations > 0 && (
              <span className="ml-1 text-xs font-bold">{pendingOperations}</span>
            )}
            {isOnline && (pendingOperations > 0 || lastSyncError) && !isSyncing && (
              <RefreshCw className="h-3 w-3 ml-1 animate-spin-slow" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;