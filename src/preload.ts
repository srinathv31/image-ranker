// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  showOpenDialog: (options: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke("dialog:openDirectory", options),
  onApiReady: (callback: () => void) => {
    ipcRenderer.on("api:ready", callback);
    return () => {
      ipcRenderer.removeListener("api:ready", callback);
    };
  },
});

// Expose API methods
contextBridge.exposeInMainWorld("api", {
  fetchFromPython: async (endpoint: string, options: RequestInit) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, options);

      // If the response is event-stream, handle the streaming
      if (response.headers.get("content-type")?.includes("text/event-stream")) {
        // Return an async iterator that can be consumed by the frontend
        return {
          async *[Symbol.asyncIterator]() {
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader available");

            const decoder = new TextDecoder();
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Keep the last line in the buffer if it's incomplete
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const jsonStr = line.slice(6); // Remove "data: " prefix
                      const data = JSON.parse(jsonStr);
                      yield data;
                    } catch (error) {
                      console.error("Error parsing SSE data:", error);
                    }
                  }
                }
              }
            } finally {
              reader.releaseLock();
            }
          },
        };
      }

      // For regular JSON responses, parse and return the data
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching from Python API:", error);
      throw error;
    }
  },

  ping: async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      return await response.json();
    } catch (error) {
      console.error("Error pinging API:", error);
      throw error;
    }
  },
});
