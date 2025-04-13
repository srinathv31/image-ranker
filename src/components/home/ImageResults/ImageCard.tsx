import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Expand } from "lucide-react";

interface ImageCardProps {
  image: {
    filename: string;
    base64_image: string;
    score: number;
  };
  index: number;
  isSelected: boolean;
  onSelect: (filename: string) => void;
  onExpand: (image: { base64: string; filename: string }) => void;
}

export default function ImageCard({
  image,
  index,
  isSelected,
  onSelect,
  onExpand,
}: ImageCardProps) {
  return (
    <div
      className={`group relative bg-muted rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <div
        className="absolute top-2 right-2 z-10 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/90 hover:bg-white"
          onClick={() =>
            onExpand({
              base64: image.base64_image,
              filename: image.filename,
            })
          }
        >
          <Expand className="h-4 w-4" />
        </Button>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(image.filename)}
          className="bg-white/90 border-white/90"
        />
      </div>
      <div
        onClick={() => onSelect(image.filename)}
        className={`absolute inset-0 bg-black/10 transition-opacity duration-200 ${
          isSelected ? "opacity-100" : "opacity-0"
        }`}
      />
      <img
        src={`data:image/jpeg;base64,${image.base64_image}`}
        alt={image.filename}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-white font-medium">Rank: {index + 1}</p>
        <p className="text-white/80 text-sm">Score: {image.score.toFixed(2)}</p>
      </div>
    </div>
  );
}
