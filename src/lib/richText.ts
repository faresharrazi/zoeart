import DOMPurify from "dompurify";

// Links that open in a new tab must not get access to this page.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// The rich text editor stores YouTube videos as [YOUTUBE:<videoId>:<url>].
// Only well-formed video IDs are turned into embeds.
const YOUTUBE_MARKER = /\[YOUTUBE:([A-Za-z0-9_-]{6,20}):[^\]]*\]/g;

const youtubeEmbed = (videoId: string) =>
  `<div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px; margin: 1rem 0;">` +
  `<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ` +
  `src="https://www.youtube.com/embed/${videoId}" title="YouTube video" loading="lazy" frameborder="0" ` +
  `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;

/** Sanitizes HTML written in the admin editor before it is rendered. */
export const renderRichText = (html: string | null | undefined) =>
  DOMPurify.sanitize(html ?? "", { ADD_ATTR: ["target"] }).replace(
    YOUTUBE_MARKER,
    (_match, videoId: string) => youtubeEmbed(videoId)
  );
