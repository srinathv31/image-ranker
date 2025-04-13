import FolderDialog from "../FolderDialog";

interface FolderSelectionProps {
  selectedFolder: string | null;
  onFolderSelect: (folderPath: string) => void;
  isProcessing: boolean;
}

export default function FolderSelection({
  selectedFolder,
  onFolderSelect,
  isProcessing,
}: FolderSelectionProps) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Step 1: Select Folder</h2>
      <FolderDialog
        onFolderSelect={onFolderSelect}
        selectedFolder={selectedFolder}
        isLoading={isProcessing}
      />
    </div>
  );
}
