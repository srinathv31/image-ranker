import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { pingBackend } from "../lib/api/ping";

export default function PingBackend() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["ping"],
    queryFn: pingBackend,
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-semibold">Backend Connection Test</h2>

      <div className="flex items-center gap-4">
        <Button onClick={() => refetch()} variant="outline">
          Ping Backend
        </Button>

        {isPending && <span>Loading...</span>}
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
