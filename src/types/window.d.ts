export {};

declare global {
  interface Window {
    api: {
      ping: () => Promise<{ message: string }>;
      fetchFromPython: <T>(
        endpoint: string,
        options?: RequestInit,
      ) => Promise<T>;
    };
    electron: {
      showOpenDialog: (
        options: Electron.OpenDialogOptions,
      ) => Promise<{ canceled: boolean; filePaths: string[] }>;
    };
  }
}
