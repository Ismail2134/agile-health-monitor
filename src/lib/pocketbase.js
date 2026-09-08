import PocketBase from 'pocketbase';

export const PB_PUBLIC_URL = import.meta.env.VITE_POCKETBASE_PUBLIC_URL || 'http://127.0.0.1:8090';

function createClient() {
  return new PocketBase(PB_PUBLIC_URL);
}

let client;

export function getPb() {
  if (!client) {
    client = createClient();
  }
  return client;
}

export function resetPb() {
  client = null;
}
