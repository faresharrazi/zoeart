import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SITE_NAME = "Aether Art Space";
const DEFAULT_DESCRIPTION =
  "Contemporary art gallery in Glyfada, Athens: exhibitions, artists and a collection of works from emerging and established artists.";
const DEFAULT_IMAGE = "/og-image.jpg";

interface SeoOptions {
  /** Page title; " | Aether Art Space" is appended. Omit on the home page. */
  title?: string;
  description?: string;
  /** Absolute or site-relative image for social previews */
  image?: string | null;
  type?: "website" | "article" | "profile";
  /** Structured data (schema.org) for this page */
  jsonLd?: Record<string, unknown>;
  /** Ask search engines not to index this page (e.g. admin, not found) */
  noIndex?: boolean;
}

const absolute = (url: string) => new URL(url, window.location.origin).href;

// Plain text for meta descriptions: no HTML, one line, at most ~160 chars
export const toMetaDescription = (text: string | null | undefined) => {
  const plain = (text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}…` : plain;
};

const setMeta = (
  attribute: "name" | "property",
  key: string,
  content: string
) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`
  );
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

/** Sets the document title, description, canonical URL and share tags. */
export function useSeo({
  title,
  description,
  image,
  type = "website",
  jsonLd,
  noIndex = false,
}: SeoOptions) {
  const { pathname } = useLocation();
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const metaDescription =
      toMetaDescription(description) || DEFAULT_DESCRIPTION;
    const url = absolute(pathname);
    const imageUrl = absolute(image || DEFAULT_IMAGE);

    document.title = fullTitle;
    setMeta("name", "description", metaDescription);
    setMeta("name", "robots", noIndex ? "noindex" : "index, follow");
    setLink("canonical", url);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", metaDescription);
    setMeta("name", "twitter:image", imageUrl);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = jsonLdText;
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, image, type, jsonLdText, noIndex, pathname]);
}
