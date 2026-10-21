import {
  Globe,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

export const getSocialMediaIcon = (
  platform: string,
  size: "sm" | "md" | "lg" = "md"
) => {
  const platformLower = platform.toLowerCase();
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const iconClass = sizeClasses[size];

  switch (platformLower) {
    case "instagram":
      return <Instagram className={`${iconClass} text-pink-500`} aria-hidden="true" />;
    case "twitter":
    case "x":
      return <Twitter className={`${iconClass} text-blue-400`} aria-hidden="true" />;
    case "linkedin":
      return <Linkedin className={`${iconClass} text-blue-600`} aria-hidden="true" />;
    case "youtube":
      return <Youtube className={`${iconClass} text-red-500`} aria-hidden="true" />;
    case "email":
      return <Mail className={`${iconClass} text-gray-500`} aria-hidden="true" />;
    case "website":
    case "web":
      return <Globe className={`${iconClass} text-green-500`} aria-hidden="true" />;
    default:
      return <Globe className={`${iconClass} text-gray-500`} aria-hidden="true" />;
  }
};

export const getSocialMediaUrl = (platform: string, handle: string) => {
  const platformLower = platform.toLowerCase();

  // If handle already contains a URL, return as is
  if (handle.startsWith("http")) {
    return handle;
  }

  // If handle starts with @, remove it for URL construction
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

  switch (platformLower) {
    case "instagram":
      return `https://instagram.com/${cleanHandle}`;
    case "twitter":
    case "x":
      return `https://x.com/${cleanHandle}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    case "email":
      return `mailto:${handle}`;
    default:
      // Websites and unknown platforms: treat the handle as a web address
      // (never as a javascript: or other scheme)
      return `https://${handle.replace(/^[a-z][a-z0-9+.-]*:\/*/i, "")}`;
  }
};
