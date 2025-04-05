import * as React from "react";
import { createRoot } from "react-dom/client";
import Counter from "./components/Counter";

export default function App() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Hello from React!</h2>
      <p>Welcome to your Electron + React + TypeScript app!</p>
      <Counter />
    </div>
  );
}

// Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }
  const root = createRoot(container);
  root.render(<App />);
});
