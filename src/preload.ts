// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  showOpenDialog: (options: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke("dialog:openDirectory", options),
});

contextBridge.exposeInMainWorld("api", {
  fetchFromPython: async (endpoint: string, options?: RequestInit) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, options);
      return await response.json();
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
