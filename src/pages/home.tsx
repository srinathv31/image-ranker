import { useState } from "react";
import { toast } from "sonner";
import {
  streamAnalyzeImages,
  streamAnalyzeImagesWithPrompt,
  ImageAnalysisComplete,
  ImageAnalysisProgress,
  ProcessingMode,
} from "../lib/api/images";
import { downloadImages } from "../lib/api/downloads";

import Header from "../components/home/Header";
import FolderSelection from "../components/home/FolderSelection";
import AnalysisOptions from "../components/home/AnalysisOptions";
import ProgressIndicator from "../components/home/ProgressIndicator";
import ImageResults from "../components/home/ImageResults/ImageResults";
import Footer from "../components/home/Footer";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImageAnalysisProgress | null>(null);
  const [results, setResults] = useState<
    ImageAnalysisComplete["top_images"] | null
  >(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath || null);
    setResults(null);
    setProgress(null);
  };

  const handleAnalyze = async (
    usePrompt: boolean,
    prompt: string,
    processingMode: ProcessingMode,
  ) => {
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

  const handleDownload = async (
    selectedImages: ImageAnalysisComplete["top_images"],
  ) => {
    const downloadPromise = downloadImages(selectedImages);

    toast.promise(downloadPromise, {
      loading: "Downloading selected images...",
      success: (data) => {
        if (data.success) {
          return `Images downloaded to ${data.downloadFolder}`;
        }
        throw new Error(data.error || "Failed to download images");
      },
      error: "Failed to download images",
    });

    return downloadPromise;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Header />

          <FolderSelection
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            isProcessing={isProcessing}
          />

          <AnalysisOptions
            onAnalyze={handleAnalyze}
            isProcessing={isProcessing}
            selectedFolder={selectedFolder}
          />

          <ProgressIndicator progress={progress} />

          <ImageResults results={results} onDownload={handleDownload} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
