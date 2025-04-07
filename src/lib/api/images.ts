export type ImageAnalysisProgress = {
  type: "progress";
  current: number;
  total: number;
  percentage: number;
  currentImage: string;
};

export type ImageAnalysisComplete = {
  type: "complete";
  top_images: {
    filename: string;
    score: number;
    base64_image: string;
  }[];
};

export type ProcessingMode = "batch" | "single";

export type ImageAnalysisResponse =
  | ImageAnalysisProgress
  | ImageAnalysisComplete;

type AsyncIterableResponse = {
  [Symbol.asyncIterator](): AsyncIterator<ImageAnalysisResponse>;
};

export async function* streamAnalyzeImages(
  folderPath: string,
  processingMode: ProcessingMode = "batch",
): AsyncGenerator<ImageAnalysisResponse, void, unknown> {
  const payload = { folder_path: folderPath, processing_mode: processingMode };
  console.log("Sending request payload:", payload);

  const response = await window.api.fetchFromPython<AsyncIterableResponse>(
    "/folder/images/stream",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    },
  );

  // The response is now an AsyncIterable
  if (Symbol.asyncIterator in response) {
    for await (const data of response) {
      yield data as ImageAnalysisResponse;
    }
  } else {
    throw new Error("Expected streaming response");
  }
}

export async function* streamAnalyzeImagesWithPrompt(
  folderPath: string,
  prompt: string,
  processingMode: ProcessingMode = "batch",
): AsyncGenerator<ImageAnalysisResponse, void, unknown> {
  const payload = {
    folder_path: folderPath,
    prompt,
    processing_mode: processingMode,
  };
  console.log("Sending request payload:", payload);

  const response = await window.api.fetchFromPython<AsyncIterableResponse>(
    "/folder/images/prompt",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    },
  );

  // The response is now an AsyncIterable
  if (Symbol.asyncIterator in response) {
    for await (const data of response) {
      yield data as ImageAnalysisResponse;
    }
  } else {
    throw new Error("Expected streaming response");
  }
}

// Keep the old function for backwards compatibility
export async function analyzeImages(
  folderPath: string,
): Promise<ImageAnalysisComplete["top_images"]> {
  const payload = { folder_path: folderPath };
  console.log("Sending request payload:", payload);

  const response = await window.api.fetchFromPython<
    AsyncIterableResponse | { top_images: ImageAnalysisComplete["top_images"] }
  >("/folder/images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (Symbol.asyncIterator in response) {
    throw new Error("Unexpected streaming response");
  }

  // Making this explicit to avoid type errors
  const topImages = (
    response as { top_images: ImageAnalysisComplete["top_images"] }
  ).top_images;

  return topImages;
}
