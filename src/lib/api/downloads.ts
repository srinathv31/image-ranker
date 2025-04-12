interface DownloadImage {
  base64_image: string;
  filename: string;
}

interface DownloadResponse {
  success: boolean;
  downloadFolder?: string;
  error?: string;
}

export async function downloadImages(
  images: DownloadImage[],
): Promise<DownloadResponse> {
  if (!images.length) {
    throw new Error("No images provided for download");
  }

  return window.electron.downloadImages(images);
}
