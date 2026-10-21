// Cloudinary serves resized, recompressed versions of an upload when
// transformations are added to its URL. Other URLs are returned unchanged.
const CLOUDINARY_UPLOAD =
  /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

interface ImageOptions {
  width?: number;
  height?: number;
  /** "fill" crops to the exact box; "limit" only scales down. */
  crop?: "fill" | "limit";
}

export const isCloudinaryUrl = (url: string | null | undefined) =>
  Boolean(url && CLOUDINARY_UPLOAD.test(url));

/** URL of an image resized for display (WebP/AVIF and auto quality). */
export const imageUrl = (
  url: string | null | undefined,
  { width, height, crop = "limit" }: ImageOptions = {}
): string => {
  if (!url) return "";
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;
  const transformation = [
    "f_auto",
    "q_auto",
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ]
    .filter(Boolean)
    .join(",");
  return `${match[1]}${transformation}/${match[2]}`;
};

/** srcSet with several widths, for responsive <img> elements. */
export const imageSrcSet = (
  url: string | null | undefined,
  widths: number[],
  { height, width: baseWidth, crop }: ImageOptions = {}
): string | undefined => {
  if (!url || !isCloudinaryUrl(url)) return undefined;
  return widths
    .map((w) => {
      const h =
        height && baseWidth ? Math.round((height * w) / baseWidth) : undefined;
      return `${imageUrl(url, { width: w, height: h, crop })} ${w}w`;
    })
    .join(", ");
};

/**
 * Loading priority hint for <img>. React 18 only passes the lowercase
 * attribute through, so spread this instead of using `fetchPriority`.
 */
export const fetchPriority = (priority: "high" | "low" | "auto") =>
  ({ fetchpriority: priority }) as Record<string, string>;
