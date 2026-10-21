import { getSocialMediaIcon, getSocialMediaUrl } from "@/lib/socialMediaIcons";

interface SocialLinksProps {
  /** Platform name to handle or URL, as stored on the artist */
  links: Record<string, unknown> | null | undefined;
  /** Used in link labels, e.g. "Eleni Markou on Instagram" */
  ownerName: string;
  className?: string;
  linkClassName: string;
}

const SocialLinks = ({
  links,
  ownerName,
  className,
  linkClassName,
}: SocialLinksProps) => {
  const entries = Object.entries(links || {}).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim() !== ""
  );
  if (entries.length === 0) return null;

  return (
    <ul className={className}>
      {entries.map(([platform, handle]) => {
        const isEmail = platform.toLowerCase() === "email";
        const name = platform.charAt(0).toUpperCase() + platform.slice(1);
        return (
          <li key={platform}>
            <a
              href={getSocialMediaUrl(platform, handle.trim())}
              {...(!isEmail && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className={linkClassName}
              aria-label={
                isEmail ? `Email ${ownerName}` : `${ownerName} on ${name}`
              }
              title={isEmail ? `Email ${ownerName}` : `${ownerName} on ${name}`}
            >
              {getSocialMediaIcon(platform, "lg")}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks;
