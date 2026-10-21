import { cn } from "@/lib/utils";

/** Underlined fields, matching the site's forms */
export const fieldClass =
  "h-11 rounded-none border-0 border-b border-ink/40 bg-transparent px-0 shadow-none focus:border-ink focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0";

/** Square toolbar button: Search, Grid / Cards / List... */
export const toolButtonClass = (active: boolean) =>
  cn(
    "inline-flex h-11 items-center gap-2 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
    active ? "bg-ink text-paper" : "text-stone hover:text-ink hover:bg-sand"
  );
