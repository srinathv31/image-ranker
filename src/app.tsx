import * as React from "react";
import { createRoot } from "react-dom/client";
import Counter from "./components/Counter";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PingBackend from "./components/PingBackend";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Image Ranker</h1>
        <PingBackend />
        <div className="mt-8">
          <Counter />
        </div>
      </div>
    </QueryClientProvider>
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
