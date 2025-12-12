import { supabase as onlineSupabase } from './client';
import { offlineStore } from '@/integrations/localforage';
import { v4 as uuidv4 } from 'uuid';

export interface OfflineOperation {
  id: string;
  tableName: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload?: any; // Data for INSERT/UPDATE
  conditions?: any; // Conditions for UPDATE/DELETE (e.g., { id: '...' })
  timestamp: string;
}

class SupabaseOfflineClient {
  private isOnline: boolean = navigator.onLine;
  private syncQueue: OfflineOperation[] = [];
  private listeners: ((queue: OfflineOperation[]) => void)[] = [];

  constructor() {
    this.loadQueue();
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
  }

  private async loadQueue() {
    const storedQueue = await offlineStore.getItem<OfflineOperation[]>('syncQueue');
    this.syncQueue = storedQueue || [];
    this.notifyListeners();
  }

  private async saveQueue() {
    await offlineStore.setItem('syncQueue', this.syncQueue);
    this.notifyListeners();
  }

  private handleOnlineStatusChange = () => {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;
    if (this.isOnline && !wasOnline) {
      console.log('App is online, starting sync...');
      // The SyncService will handle the actual processing
    }
    this.notifyListeners();
  };

  public getSyncQueue(): OfflineOperation[] {
    return this.syncQueue;
  }

  public addQueueListener(listener: (queue: OfflineOperation[]) => void) {
    this.listeners.push(listener);
    listener(this.syncQueue); // Immediately notify with current state
  }

  public removeQueueListener(listener: (queue: OfflineOperation[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncQueue));
  }

  public async processQueueItem(operationId: string): Promise<boolean> {
    const operationIndex = this.syncQueue.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return false;

    const operation = this.syncQueue[operationIndex];
    console.log('Processing offline operation:', operation);

    try {
      let result;
      switch (operation.type) {
        case 'INSERT':
          result = await onlineSupabase.from(operation.tableName).insert(operation.payload);
          break;
        case 'UPDATE':
          result = await onlineSupabase.from(operation.tableName).update(operation.payload).match(operation.conditions);
          break;
        case 'DELETE':
          result = await onlineSupabase.from(operation.tableName).delete().match(operation.conditions);
          break;
        default:
          console.warn('Unknown operation type:', operation.type);
          return false;
      }

      if (result.error) {
        console.error('Error processing offline operation:', result.error);
        // Basic conflict resolution: if it's an update and the row is not found, it might have been deleted online.
        // For now, we'll just re-throw to indicate failure, SyncService can decide to remove or retry.
        throw result.error;
      }

      // Remove from queue on success
      this.syncQueue.splice(operationIndex, 1);
      await this.saveQueue();
      return true;
    } catch (error) {
      console.error('Failed to process offline operation:', error);
      throw error; // Re-throw to allow SyncService to handle retries/errors
    }
  }

  public async clearQueue() {
    this.syncQueue = [];
    await this.saveQueue();
  }

  // --- Intercepted Supabase methods ---
  from(tableName: string) {
    return {
      insert: async (payload: any) => {
        if (!this.isOnline) {
          const operation: OfflineOperation = {
            id: uuidv4(),
            tableName,
            type: 'INSERT',
            payload,
            timestamp: new Date().toISOString(),
          };
          this.syncQueue.push(operation);
          await this.saveQueue();
          console.log('Offline INSERT queued:', operation);
          // Simulate Supabase response for immediate UI update
          return { data: { ...payload, id: uuidv4() }, error: null };
        } else {
          return onlineSupabase.from(tableName).insert(payload);
        }
      },
      update: (payload: any) => ({
        match: async (conditions: any) => {
          if (!this.isOnline) {
            const operation: OfflineOperation = {
              id: uuidv4(),
              tableName,
              type: 'UPDATE',
              payload,
              conditions,
              timestamp: new Date().toISOString(),
            };
            this.syncQueue.push(operation);
            await this.saveQueue();
            console.log('Offline UPDATE queued:', operation);
            // Simulate Supabase response
            return { data: { ...payload, ...conditions }, error: null };
          } else {
            return onlineSupabase.from(tableName).update(payload).match(conditions);
          }
        },
      }),
      delete: () => ({
        match: async (conditions: any) => {
          if (!this.isOnline) {
            const operation: OfflineOperation = {
              id: uuidv4(),
              tableName,
              type: 'DELETE',
              conditions,
              timestamp: new Date().toISOString(),
            };
            this.syncQueue.push(operation);
            await this.saveQueue();
            console.log('Offline DELETE queued:', operation);
            // Simulate Supabase response
            return { data: null, error: null };
          } else {
            return onlineSupabase.from(tableName).delete().match(conditions);
          }
        },
      }),
      select: async (columns?: string) => {
        // For SELECT, we always try online first. If offline, we'd need a caching strategy.
        // For now, we'll let the original Supabase client handle it, which will fail if offline.
        // A more advanced offline-first would cache reads in dataStore.
        if (!this.isOnline) {
          console.warn('Attempted SELECT while offline. This will likely fail without a read-cache strategy.');
        }
        return onlineSupabase.from(tableName).select(columns);
      },
      // Add other methods as needed, e.g., `rpc`, `storage`
    };
  }

  // Expose the original Supabase client for non-intercepted operations (e.g., auth, storage)
  public get onlineClient() {
    return onlineSupabase;
  }
}

export const offlineSupabase = new SupabaseOfflineClient();