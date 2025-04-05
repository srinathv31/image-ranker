declare global {
  interface Window {
    api: {
      ping: () => Promise<{ message: string }>;
      fetchFromPython: (endpoint: string) => Promise<any>;
    };
  }
}

export async function pingBackend() {
  return window.api.ping();
}
