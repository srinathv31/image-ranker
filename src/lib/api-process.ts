import { spawn, ChildProcess } from "child_process";
import { app } from "electron";
import log from "electron-log";
import path from "path";

let apiProcess: ChildProcess | null = null;

async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:8000/");
    if (!response.ok) {
      log.warn("API health check failed with status:", response.status);
      return false;
    }
    // Try to get a real response from the API to ensure it's our instance
    const data = await response.json();
    log.info("API health check response:", data);

    return true;
  } catch (error) {
    log.debug("API health check failed:", error);
    return false;
  }
}

async function waitForApiReady(timeoutMs = 30000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await checkApiHealth()) {
      log.info("API is ready and responding");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("API failed to become ready in time");
}

export function startApiProcess(): Promise<void> {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      log.info("Development mode: Skipping API process management");
      // In dev mode, still check if API is responding
      waitForApiReady().then(resolve).catch(reject);
      return;
    }

    // If we already have a running process, just check if it's healthy
    if (apiProcess) {
      log.info("API process exists, checking health");
      waitForApiReady(5000)
        .then(resolve)
        .catch(() => {
          log.warn(
            "Existing API process not responding, starting new instance",
          );
          startNewApiProcess();
        });
      return;
    }

    startNewApiProcess();

    function startNewApiProcess() {
      const apiPath = path.join(process.resourcesPath, "api");
      log.info("Starting API process from:", apiPath);

      apiProcess = spawn(apiPath, [], {
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      apiProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        log.info("API stdout:", output);
      });

      apiProcess.stderr?.on("data", (data) => {
        const output = data.toString();
        log.error("API stderr:", output);
      });

      apiProcess.on("error", (error) => {
        log.error("Failed to start API process:", error);
        apiProcess = null;
        reject(error);
      });

      apiProcess.on("exit", (code, signal) => {
        log.info(`API process exited with code ${code} and signal ${signal}`);
        apiProcess = null;
      });

      // Wait for API to become ready
      waitForApiReady().then(resolve).catch(reject);
    }

    // Ensure the API process is killed when the app exits
    const killApi = () => {
      if (apiProcess) {
        log.info("Terminating API process");
        try {
          if (process.platform !== "win32" && apiProcess.pid) {
            // On Unix systems, negative pid kills the process group
            log.info(`Killing process group ${-apiProcess.pid}`);
            process.kill(-apiProcess.pid, "SIGTERM");
          } else {
            // Windows fallback
            apiProcess.kill("SIGTERM");
          }
        } catch (error) {
          log.error("Error killing API process:", error);
        }
        apiProcess = null;
      }
    };

    // Register the kill handler for app quit
    app.on("will-quit", killApi);
  });
}
