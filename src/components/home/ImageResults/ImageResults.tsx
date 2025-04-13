import { useState } from "react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Download } from "lucide-react";
import { ImageAnalysisComplete } from "../../../lib/api/images";
import ImageCard from "./ImageCard";
import ImageExpandDialog from "./ImageExpandDialog";

interface ImageResultsProps {
  results: ImageAnalysisComplete["top_images"] | null;
  onDownload: (selectedImages: ImageAnalysisComplete["top_images"]) => Promise<{
    success: boolean;
    downloadFolder?: string;
    error?: string;
  }>;
}

export default function ImageResults({
  results,
  onDownload,
}: ImageResultsProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{
    base64: string;
    filename: string;
  } | null>(null);

  if (!results) return null;

  const toggleSelectAll = () => {
    if (selectedImages.size === results.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(results.map((img) => img.filename)));
    }
  };

  const toggleImageSelection = (filename: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedImages(newSelected);
  };

  const handleDownload = async () => {
    if (selectedImages.size === 0) return;

    const selectedImageData = results.filter((img) =>
      selectedImages.has(img.filename),
    );
    setIsDownloading(true);

    try {
      await onDownload(selectedImageData);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Results</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                results.length > 0 && selectedImages.size === results.length
              }
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm">
              Select All
            </label>
          </div>
          {selectedImages.size > 0 && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading
                ? "Downloading..."
                : `Download (${selectedImages.size})`}
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results
          .sort((a, b) => b.score - a.score)
          .map((image, index) => (
            <ImageCard
              key={image.filename}
              image={image}
              index={index}
              isSelected={selectedImages.has(image.filename)}
              onSelect={toggleImageSelection}
              onExpand={setExpandedImage}
            />
          ))}
      </div>

      <ImageExpandDialog
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}
