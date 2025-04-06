import StatusIndicator from "../components/StatusIndicator";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import FolderDialog from "../components/FolderDialog";
import {
  streamAnalyzeImages,
  streamAnalyzeImagesWithPrompt,
  ImageAnalysisComplete,
  ImageAnalysisProgress,
} from "../lib/api/images";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Progress } from "../components/ui/progress";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImageAnalysisProgress | null>(null);
  const [results, setResults] = useState<
    ImageAnalysisComplete["top_images"] | null
  >(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const handleFolderSelect = async (folderPath: string) => {
    setSelectedFolder(folderPath);
    setIsProcessing(true);
    setProgress(null);
    setResults(null);

    try {
      const encodedFolderPath = encodeURIComponent(folderPath);
      for await (const update of streamAnalyzeImages(encodedFolderPath)) {
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

  const handlePromptSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFolder) {
      toast.error("Please select a folder first");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setResults(null);

    try {
      const encodedFolderPath = encodeURIComponent(selectedFolder);
      for await (const update of streamAnalyzeImagesWithPrompt(
        encodedFolderPath,
        prompt,
      )) {
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
      {/* Hero Section */}
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
          <div className="flex gap-4 justify-center">
            <FolderDialog
              onFolderSelect={handleFolderSelect}
              isLoading={isProcessing}
            />
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Prompt Form */}
          <form
            onSubmit={handlePromptSubmit}
            className="max-w-md mx-auto space-y-4"
          >
            <Input
              type="text"
              placeholder="Enter a prompt to find similar images..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing || !selectedFolder}
            />
            <Button
              type="submit"
              disabled={isProcessing || !selectedFolder || !prompt.trim()}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Find Similar Images"}
            </Button>
          </form>

          {/* Progress Section */}
          {progress && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing: {progress.currentImage}</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <Progress value={progress.percentage} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processed {progress.current} of {progress.total} images
              </p>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Top Images
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results
                  .sort((a, b) => b.score - a.score)
                  .map((image, index) => (
                    <div
                      key={image.filename}
                      className="flex flex-col items-center bg-gray-100 p-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                      <img
                        src={`data:image/jpeg;base64,${image.base64_image}`}
                        alt={image.filename}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <p className="text-sm text-gray-500">Rank: {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        Score: {image.score.toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">Easy Organization</h3>
            <p className="text-muted-foreground">
              Effortlessly organize your images into collections and categories.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">Smart Ranking</h3>
            <p className="text-muted-foreground">
              Rank and rate your images with an intuitive interface.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">Fast Search</h3>
            <p className="text-muted-foreground">
              Quickly find the images you need with powerful search
              capabilities.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
