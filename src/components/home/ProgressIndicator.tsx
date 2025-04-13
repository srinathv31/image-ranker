import { Progress } from "../ui/progress";
import { ImageAnalysisProgress } from "../../lib/api/images";

interface ProgressIndicatorProps {
  progress: ImageAnalysisProgress | null;
}

export default function ProgressIndicator({
  progress,
}: ProgressIndicatorProps) {
  if (!progress) return null;

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Processing: {progress.currentImage}</span>
          <span>{Math.round(progress.percentage)}%</span>
        </div>
        <Progress value={progress.percentage} className="w-full" />
        <p className="text-sm text-muted-foreground">
          Processed {progress.current} of {progress.total} images
        </p>
      </div>
    </div>
  );
}
