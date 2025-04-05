// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Expose API communication methods
  fetchFromPython: async (endpoint: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching from Python API:", error);
      throw error;
    }
  },

  // Add more API methods as needed
  ping: async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/dummy");
      return await response.json();
    } catch (error) {
      console.error("Error pinging API:", error);
      throw error;
    }
  },
});
