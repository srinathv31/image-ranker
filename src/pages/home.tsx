import StatusIndicator from "../components/StatusIndicator";
import { Button } from "../components/ui/button";
import FolderDialog from "../components/FolderDialog";
import { analyzeImages } from "../lib/api/images";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Home() {
  const folderMutation = useMutation({
    mutationFn: analyzeImages,
    onSuccess: (data) => {
      toast.success("Images analyzed successfully");
      console.log("Images analyzed:", data);
    },
    onError: (error) => {
      toast.error("Failed to analyze images");
      console.error("Error analyzing images:", error);
    },
  });

  const handleFolderSelect = async (folderPath: string) => {
    // make the path url encoded
    const encodedFolderPath = encodeURIComponent(folderPath);
    folderMutation.mutate(encodedFolderPath);
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
              isLoading={folderMutation.isPending}
            />
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          {folderMutation.data && (
            <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Top Images
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {folderMutation.data.top_images
                  .sort((a, b) => b.score - a.score) // Sort by score descending
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
                      {/* <h3 className="text-lg text-wrap font-semibold text-gray-700">
                        {image.filename}
                      </h3> */}
                      <p className="text-sm text-gray-500">
                        Rank: {index + 1} {/* Display rank */}
                      </p>
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
