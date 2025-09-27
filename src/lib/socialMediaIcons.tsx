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
      return <Instagram className={`${iconClass} text-pink-500`} />;
    case "twitter":
    case "x":
      return <Twitter className={`${iconClass} text-blue-400`} />;
    case "linkedin":
      return <Linkedin className={`${iconClass} text-blue-600`} />;
    case "youtube":
      return <Youtube className={`${iconClass} text-red-500`} />;
    case "email":
      return <Mail className={`${iconClass} text-gray-500`} />;
    case "website":
    case "web":
      return <Globe className={`${iconClass} text-green-500`} />;
    default:
      return <Globe className={`${iconClass} text-gray-500`} />;
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
    case "website":
    case "web":
      return handle.startsWith("http") ? handle : `https://${handle}`;
    default:
      return handle;
  }
};
