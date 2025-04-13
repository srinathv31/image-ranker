import { Dialog, DialogContent, DialogClose } from "../../ui/dialog";

interface ImageExpandDialogProps {
  image: {
    base64: string;
    filename: string;
  } | null;
  onClose: () => void;
}

export default function ImageExpandDialog({
  image,
  onClose,
}: ImageExpandDialogProps) {
  return (
    <Dialog open={image !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 overflow-hidden flex items-center justify-center border-none">
        {image && (
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <DialogClose />
            <div className="relative max-w-full max-h-[85vh] flex flex-col">
              <img
                src={`data:image/jpeg;base64,${image.base64}`}
                alt={image.filename}
                className="object-contain max-h-[85vh] w-auto"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
