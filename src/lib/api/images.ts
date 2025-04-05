export async function analyzeImages(
  folderPath: string,
): Promise<{
  top_images: { filename: string; score: number; base64_image: string }[];
}> {
  const payload = { folder_path: folderPath };
  console.log("Sending request payload:", payload);

  return window.api.fetchFromPython("/folder/images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
