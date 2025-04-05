import App from "./app";
import { createRoot } from "react-dom/client";

// Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }
  const root = createRoot(container);
  root.render(<App />);
});
