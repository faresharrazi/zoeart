import { useState } from "react";

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Rendered instead of the image when there is no src or it fails to load. */
  fallback: React.ReactNode;
};

const ImageWithFallback = ({
  src,
  fallback,
  onError,
  ...props
}: ImageWithFallbackProps) => {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();

  if (!src || failedSrc === src) return <>{fallback}</>;

  return (
    <img
      src={src}
      onError={(e) => {
        setFailedSrc(src);
        onError?.(e);
      }}
      {...props}
    />
  );
};

export default ImageWithFallback;
