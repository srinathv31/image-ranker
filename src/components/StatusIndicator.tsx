import { useQuery } from "@tanstack/react-query";
import { pingBackend } from "../lib/api/ping";
import { cn } from "../lib/utils";

export default function StatusIndicator() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["ping"],
    queryFn: pingBackend,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("size-2 rounded-full transition-colors duration-200", {
          "bg-green-500": data && !isError,
          "bg-red-500": isError,
          "bg-yellow-500 animate-pulse": isPending,
        })}
      />
      <span className="text-sm text-muted-foreground">
        {isError ? "Backend Offline" : "Backend Online"}
      </span>
    </div>
  );
}
