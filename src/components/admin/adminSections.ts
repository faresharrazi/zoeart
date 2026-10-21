import {
  BarChart3,
  CalendarDays,
  Clock,
  Handshake,
  Link2,
  Mail,
  Newspaper,
  Palette,
  PanelsTopLeft,
  UserCog,
  Users,
} from "lucide-react";

/** Admin sections, grouped as they appear in the sidebar. */
export const SECTION_GROUPS = [
  {
    label: "Overview",
    items: [{ id: "analytics", label: "Analytics", icon: BarChart3 }],
  },
  {
    label: "Programme",
    items: [
      { id: "exhibitions", label: "Exhibitions", icon: CalendarDays },
      { id: "articles", label: "Articles", icon: Newspaper },
      { id: "artists", label: "Artists", icon: Users },
      { id: "artworks", label: "Artworks", icon: Palette },
    ],
  },
  {
    label: "Website",
    items: [
      { id: "pages", label: "Pages", icon: PanelsTopLeft },
      { id: "contact", label: "Contact & hours", icon: Clock },
      { id: "partners", label: "Partners", icon: Handshake },
    ],
  },
  {
    label: "Audience",
    items: [{ id: "newsletter", label: "Newsletter", icon: Mail }],
  },
  {
    label: "Settings",
    items: [
      { id: "users", label: "Admin users", icon: UserCog },
      { id: "links", label: "Useful links", icon: Link2 },
    ],
  },
] as const;

export type SectionId = (typeof SECTION_GROUPS)[number]["items"][number]["id"];
