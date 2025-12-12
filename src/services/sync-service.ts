import { offlineSupabase, OfflineOperation } from '@/integrations/supabase/offline-client';
import { showSuccess, showError } from '@/utils/toast';

const MAX_RETRIES = 3; // Maximum number of retries for an operation

class SyncService {
  private isSyncing: boolean = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private syncStatusListeners: ((status: { isOnline: boolean; isSyncing: boolean; pendingOperations: number; lastSyncError: string | null }) => void)[] = [];
  private lastSyncError: string | null = null;

  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    // Initial check
    this.notifyListeners();
  }

  private handleOnline = () => {
    console.log('SyncService: Online detected. Starting sync...');
    this.startSync();
    this.notifyListeners();
  };

  private handleOffline = () => {
    console.log('SyncService: Offline detected. Stopping sync...');
    this.stopSync();
    this.notifyListeners();
  };

  public addSyncStatusListener(listener: (status: { isOnline: boolean; isSyncing: boolean; pendingOperations: number; lastSyncError: string | null }) => void) {
    this.syncStatusListeners.push(listener);
    listener(this.getStatus()); // Immediately notify with current state
  }

  public removeSyncStatusListener(listener: (status: { isOnline: boolean; isSyncing: boolean; pendingOperations: number; lastSyncError: string | null }) => void) {
    this.syncStatusListeners = this.syncStatusListeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.syncStatusListeners.forEach(listener => listener(this.getStatus()));
  }

  public getStatus() {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      pendingOperations: offlineSupabase.getSyncQueue().length,
      lastSyncError: this.lastSyncError,
    };
  }

  public startSync() {
    if (!navigator.onLine || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.lastSyncError = null;
    this.notifyListeners();
    console.log('SyncService: Sync started.');

    // Process immediately and then set interval for continuous sync
    this.processQueue();
    this.syncInterval = setInterval(this.processQueue, 10000); // Try to sync every 10 seconds
  }

  public stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isSyncing = false;
    this.notifyListeners();
    console.log('SyncService: Sync stopped.');
  }

  private processQueue = async () => {
    if (!navigator.onLine) {
      this.stopSync();
      return;
    }

    const queue = offlineSupabase.getSyncQueue();
    if (queue.length === 0) {
      this.stopSync(); // No more items, stop syncing
      showSuccess('Sincronización completada. Todos los cambios offline han sido guardados.');
      return;
    }

    console.log(`SyncService: Processing ${queue.length} pending operations...`);
    this.notifyListeners();

    // Process one item at a time to handle errors gracefully
    const operation = queue[0]; // Always process the first item
    try {
      await offlineSupabase.processQueueItem(operation.id);
      this.lastSyncError = null; // Clear error on success
      console.log(`SyncService: Operation ${operation.id} (${operation.type}) synced successfully.`);
      // The queue is modified by offlineSupabase.processQueueItem, so next iteration will get the new first item
    } catch (error: any) {
      // Check if max retries reached
      if (operation.retries >= MAX_RETRIES) {
        console.error(`SyncService: Operation ${operation.id} (${operation.type}) failed after ${MAX_RETRIES} retries. Removing from queue.`);
        this.lastSyncError = `Error persistente al sincronizar ${operation.type} en ${operation.tableName}: ${operation.lastError || error.message}. Eliminado de la cola.`;
        showError(this.lastSyncError);
        // Manually remove the failed operation from the queue
        const currentQueue = offlineSupabase.getSyncQueue();
        const indexToRemove = currentQueue.findIndex(op => op.id === operation.id);
        if (indexToRemove !== -1) {
          currentQueue.splice(indexToRemove, 1);
          // Note: offlineSupabase.saveQueue() is private, so we'd need a public method or direct access.
          // For now, we'll rely on the next successful operation or a full page refresh to clear it from localforage.
          // A more robust solution would involve a dedicated 'failed operations' store.
        }
      } else {
        console.warn(`SyncService: Failed to sync operation ${operation.id} (${operation.type}). Retrying (${operation.retries}/${MAX_RETRIES})...`);
        this.lastSyncError = `Error al sincronizar ${operation.type} en ${operation.tableName}: ${operation.lastError || error.message}. Reintentando...`;
        showError(this.lastSyncError);
      }
    } finally {
      this.notifyListeners();
    }
  };

  public async forceSync() {
    if (navigator.onLine) {
      showSuccess('Intentando sincronización manual...');
      this.startSync();
    } else {
      showError('No hay conexión a internet para forzar la sincronización.');
    }
  }
}

export const syncService = new SyncService();