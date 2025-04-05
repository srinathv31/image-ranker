import { useState } from "react";
import { Button } from "./ui/button";

interface FolderDialogProps {
  onFolderSelect: (path: string) => void;
  isLoading?: boolean;
}

export default function FolderDialog({
  onFolderSelect,
  isLoading = false,
}: FolderDialogProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleClick = async () => {
    setIsSelecting(true);
    try {
      // Use electron's dialog API through the window.electron interface
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
      : "Get Started";
  const disabled = isLoading || isSelecting;

  return (
    <Button size="lg" onClick={handleClick} disabled={disabled}>
      {buttonText}
    </Button>
  );
}
