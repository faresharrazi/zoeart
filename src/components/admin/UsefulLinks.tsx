import { ArrowUpRight, FileImage, Image as ImageIcon } from "lucide-react";
import GoogleDriveConverter from "./GoogleDriveConverter";
import { AdminPage, Panel } from "./AdminUI";

const LINKS = [
  {
    title: "Compress JPEG images",
    description:
      "Make photos smaller before uploading them, without visible loss of quality.",
    url: "https://compressjpeg.com/",
    icon: ImageIcon,
  },
  {
    title: "Convert PNG to JPG",
    description:
      "Turn PNG images into lighter JPG files when they don't need a transparent background.",
    url: "https://png2jpg.com/",
    icon: FileImage,
  },
];

const TIPS = [
  "Use JPG for photographs and artwork images.",
  "Compress images before uploading: pages load faster.",
  "Convert PNG to JPG when transparency isn't needed.",
  "Aim for images under 1 MB.",
];

const UsefulLinks = () => (
  <AdminPage
    title="Useful links"
    description="Handy tools for preparing images and files before you upload them."
  >
    <ul className="grid gap-4 sm:grid-cols-2">
      {LINKS.map(({ title, description, url, icon: Icon }) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full gap-4 rounded-xl border bg-white p-5 shadow-[0_1px_2px_hsl(var(--ink)/0.04)] transition-colors hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-stone">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                {title}
                <ArrowUpRight
                  className="size-4 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-sm text-mist">
                {description}
              </span>
              <span className="mt-3 block text-xs text-stone">
                {new URL(url).hostname}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>

    <GoogleDriveConverter />

    <Panel title="Tips for images">
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-stone marker:text-mist">
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Panel>
  </AdminPage>
);

export default UsefulLinks;
