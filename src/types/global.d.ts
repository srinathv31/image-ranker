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
      onApiReady: (callback: () => void) => () => void;
      downloadImages: (
        images: { base64_image: string; filename: string }[],
      ) => Promise<{
        success: boolean;
        downloadFolder?: string;
        error?: string;
      }>;
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
