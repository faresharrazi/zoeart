// The `download` attribute is ignored for images on another origin (such as
// Cloudinary), so fetch the file and save it from a local blob URL instead.
export async function downloadImage(url: string, baseName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${baseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch {
    // Fall back to opening the image so it can be saved from the browser
    window.open(url, "_blank", "noopener");
  }
}
