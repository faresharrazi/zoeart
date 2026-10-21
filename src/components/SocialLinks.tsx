import { getSocialMediaUrl } from "@/lib/socialMediaIcons";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  /** Platform name to handle or URL, as stored on the artist */
  links: Record<string, unknown> | null | undefined;
  /** Used in link labels, e.g. "Eleni Markou on Instagram" */
  ownerName: string;
  className?: string;
}

const platformName = (platform: string) =>
  ({ x: "X", linkedin: "LinkedIn", youtube: "YouTube" })[
    platform.toLowerCase()
  ] ?? platform.charAt(0).toUpperCase() + platform.slice(1);

/** An artist's web and social links, as plain text links. */
const SocialLinks = ({ links, ownerName, className }: SocialLinksProps) => {
  const entries = Object.entries(links || {}).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim() !== ""
  );
  if (entries.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm", className)}>
      {entries.map(([platform, handle]) => {
        const isEmail = platform.toLowerCase() === "email";
        const name = platformName(platform);
        return (
          <li key={platform}>
            <a
              href={getSocialMediaUrl(platform, handle.trim())}
              {...(!isEmail && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="relative z-10 border-b border-ink/30 pb-0.5 hover:border-ink transition-colors"
              aria-label={
                isEmail ? `Email ${ownerName}` : `${ownerName} on ${name}`
              }
            >
              {name}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks;
