export async function uploadFolder(folderPath: string) {
  const payload = { folder_path: folderPath };
  console.log("Sending request payload:", payload);

  return window.api.fetchFromPython("/folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
