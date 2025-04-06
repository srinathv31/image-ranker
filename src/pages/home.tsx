import StatusIndicator from "../components/StatusIndicator";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import FolderDialog from "../components/FolderDialog";
import {
  streamAnalyzeImages,
  streamAnalyzeImagesWithPrompt,
  ImageAnalysisComplete,
  ImageAnalysisProgress,
  ProcessingMode,
} from "../lib/api/images";
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "../components/ui/progress";
import { Sparkles, Search, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImageAnalysisProgress | null>(null);
  const [results, setResults] = useState<
    ImageAnalysisComplete["top_images"] | null
  >(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("batch");

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath || null);
    setResults(null);
    setProgress(null);
    setPrompt("");
  };

  const analyzeImages = async (usePrompt = false) => {
    if (!selectedFolder) {
      toast.error("Please select a folder first");
      return;
    }
    if (usePrompt && !prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setResults(null);

    try {
      const encodedFolderPath = encodeURIComponent(selectedFolder);
      const stream = usePrompt
        ? streamAnalyzeImagesWithPrompt(
            encodedFolderPath,
            prompt,
            processingMode,
          )
        : streamAnalyzeImages(encodedFolderPath, processingMode);

      // render the progress bar so it doesn't wait for the first batch
      setProgress({
        type: "progress",
        current: 0,
        total: 0,
        percentage: 0,
        currentImage: "",
      });

      for await (const update of stream) {
        if (update.type === "progress") {
          setProgress(update);
        } else if (update.type === "complete") {
          setResults(update.top_images);
          toast.success("Images analyzed successfully");
        }
      }
    } catch (error) {
      toast.error("Failed to analyze images");
      console.error("Error analyzing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight">
            Image{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ranker
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and rank your images with ease. A powerful desktop
            application for managing and rating your image collections.
          </p>

          {/* Step 1: Folder Selection */}
          <div className="mt-12">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">
                Step 1: Select Folder
              </h2>
              <FolderDialog
                onFolderSelect={handleFolderSelect}
                selectedFolder={selectedFolder}
                isLoading={isProcessing}
              />
            </div>
          </div>

          {/* Step 2: Analysis Options */}
          {selectedFolder && (
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
                    onClick={() => analyzeImages(false)}
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
                      onClick={() => analyzeImages(true)}
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
                  onValueChange={(value: ProcessingMode) =>
                    setProcessingMode(value)
                  }
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
          )}

          {/* Progress Section */}
          {progress && (
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
          )}

          {/* Results Section */}
          {results && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results
                  .sort((a, b) => b.score - a.score)
                  .map((image, index) => (
                    <div
                      key={image.filename}
                      className="group relative bg-muted rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    >
                      <img
                        src={`data:image/jpeg;base64,${image.base64_image}`}
                        alt={image.filename}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-medium">
                          Rank: {index + 1}
                        </p>
                        <p className="text-white/80 text-sm">
                          Score: {image.score.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Image Ranker. All rights reserved.
          </p>
          <StatusIndicator />
        </div>
      </footer>
    </div>
  );
}
