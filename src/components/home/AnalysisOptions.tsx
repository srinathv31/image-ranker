import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sparkles, Search, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ProcessingMode } from "../../lib/api/images";
import { useState } from "react";

interface AnalysisOptionsProps {
  onAnalyze: (
    usePrompt: boolean,
    prompt: string,
    processingMode: ProcessingMode,
  ) => void;
  isProcessing: boolean;
  selectedFolder: string | null;
}

export default function AnalysisOptions({
  onAnalyze,
  isProcessing,
  selectedFolder,
}: AnalysisOptionsProps) {
  const [prompt, setPrompt] = useState("");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("batch");

  if (!selectedFolder) return null;

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Step 2: Choose Analysis Method
      </h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Most Aesthetic Option */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Most Aesthetic</h3>
          <p className="text-sm text-muted-foreground">
            Find the most visually appealing images in your collection
          </p>
          <Button
            onClick={() => onAnalyze(false, "", processingMode)}
            disabled={isProcessing}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isProcessing ? "Processing..." : "Find Best Images"}
          </Button>
        </div>

        {/* Custom Prompt Option */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Custom Search</h3>
          <p className="text-sm text-muted-foreground">
            Find images that match your specific description
          </p>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your description..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing}
            />
            <Button
              onClick={() => onAnalyze(true, prompt, processingMode)}
              disabled={isProcessing || !prompt.trim()}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Search Images"}
            </Button>
          </div>
        </div>
      </div>

      {/* Processing Mode Selector */}
      <div className="mt-6 flex justify-end items-center gap-2">
        <Settings2 className="w-4 h-4 text-muted-foreground" />
        <Select
          disabled={isProcessing}
          value={processingMode}
          onValueChange={(value: ProcessingMode) => setProcessingMode(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Processing Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch">Batch Mode (Faster)</SelectItem>
            <SelectItem value="single">Single Mode (Slower)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
