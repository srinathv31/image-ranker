import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">Starting Image Ranker</h2>
        <p className="text-muted-foreground">
          Please wait while we initialize the application...
        </p>
      </div>
    </div>
  );
}
