import { useState } from "react";
import { Button } from "./ui/button";
import { Folder } from "lucide-react";

interface FolderDialogProps {
  onFolderSelect: (path: string) => void;
  selectedFolder: string | null;
  isLoading?: boolean;
}

export default function FolderDialog({
  onFolderSelect,
  selectedFolder,
  isLoading = false,
}: FolderDialogProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleClick = async () => {
    setIsSelecting(true);
    try {
      const result = await window.electron.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        onFolderSelect(selectedPath);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  const buttonText = isLoading
    ? "Processing..."
    : isSelecting
      ? "Selecting..."
      : selectedFolder
        ? "Change Folder"
        : "Select Folder";
  const disabled = isLoading || isSelecting;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={handleClick}
          disabled={disabled}
          variant={selectedFolder ? "outline" : "default"}
          className="w-full"
        >
          <Folder className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>

        {selectedFolder && (
          <div className="w-full bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-4 h-4 flex-shrink-0" />
                <p dir="rtl" className="text-sm text-muted-foreground truncate">
                  {selectedFolder}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFolderSelect("")}
                className="flex-shrink-0"
                disabled={isLoading || isSelecting}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
