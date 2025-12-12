import { offlineSupabase, OfflineOperation } from '@/integrations/supabase/offline-client';
import { showSuccess, showError } from '@/utils/toast';

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
      console.error(`SyncService: Failed to sync operation ${operation.id} (${operation.type}):`, error);
      this.lastSyncError = `Error al sincronizar ${operation.type} en ${operation.tableName}: ${error.message}`;
      showError(this.lastSyncError);
      // For basic conflict resolution, if an update/delete fails because the item doesn't exist,
      // we might want to remove it from the queue or mark it as unresolvable.
      // For now, we'll leave it in the queue to retry, but a more advanced system
      // would require user intervention or more sophisticated logic.
      // To prevent infinite retries on persistent errors, we could implement a retry count.
      // For this implementation, we'll just log and keep it in queue for next attempt.
    } finally {
      this.notifyListeners();
    }
  };

  public async forceSync() {
    if (navigator.onLine) {
      this.startSync();
    } else {
      showError('No hay conexión a internet para forzar la sincronización.');
    }
  }
}

export const syncService = new SyncService();