import localforage from 'localforage';

export const offlineStore = localforage.createInstance({
  name: 'mifonoconsulta_offline_store',
  storeName: 'sync_queue',
  description: 'Stores pending Supabase operations for offline synchronization',
});

export const dataStore = localforage.createInstance({
  name: 'mifonoconsulta_data_store',
  storeName: 'cached_data',
  description: 'Stores cached data for offline access',
});