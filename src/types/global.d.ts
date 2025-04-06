export {};

type AsyncIterableResponse = {
  [Symbol.asyncIterator](): AsyncIterator<unknown>;
};

declare global {
  interface Window {
    electron: {
      showOpenDialog: (
        options: Electron.OpenDialogOptions,
      ) => Promise<Electron.OpenDialogReturnValue>;
    };
    api: {
      fetchFromPython: <T = unknown>(
        endpoint: string,
        options: RequestInit,
      ) => Promise<T | AsyncIterableResponse>;
      ping: () => Promise<{ status: string; message: string }>;
    };
  }
}
