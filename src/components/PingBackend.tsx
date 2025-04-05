import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";

interface PingResponse {
  message: string;
}

export default function PingBackend() {
  const { data, isLoading, isError, error, refetch } = useQuery<PingResponse>({
    queryKey: ["ping"],
    queryFn: async () => {
      const response = await fetch("http://127.0.0.1:8000/dummy");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
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
          <span className="text-red-500">Error: {error.message}</span>
        )}
        {data && (
          <span className="text-green-500">Response: {data.message}</span>
        )}
      </div>
    </div>
  );
}
