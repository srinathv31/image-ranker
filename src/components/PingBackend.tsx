import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";

// Define the window interface with our API
declare global {
  interface Window {
    api: {
      ping: () => Promise<{ message: string }>;
      fetchFromPython: (endpoint: string) => Promise<any>;
    };
  }
}

export default function PingBackend() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ping"],
    queryFn: () => window.api.ping(),
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-semibold">Backend Connection Test</h2>

      <div className="flex items-center gap-4">
        <Button onClick={() => refetch()} variant="outline">
          Ping Backend
        </Button>

        {isLoading && <span>Loading...</span>}
        {isError && (
          <span className="text-red-500">
            Error: {(error as Error).message}
          </span>
        )}
        {data && (
          <span className="text-green-500">Response: {data.message}</span>
        )}
      </div>
    </div>
  );
}
