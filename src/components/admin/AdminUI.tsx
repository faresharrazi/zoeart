/**
 * Building blocks shared by every admin section, so they all look and behave
 * the same: page header, panels, stats, list rows, status badges, quiet icon
 * actions and confirmations.
 */
import { forwardRef, type ComponentType, type ReactNode } from "react";
import { ArrowLeft, Loader2, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string }>;

/** Title, description and main actions at the top of a section. */
export const AdminPage = ({
  title,
  description,
  actions,
  onBack,
  backLabel = "Back",
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Shows a back arrow before the title (edit forms) */
  onBack?: () => void;
  backLabel?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={cn("mx-auto w-full max-w-6xl space-y-6", className)}>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {onBack && (
          <IconAction
            label={backLabel}
            icon={ArrowLeft}
            onClick={onBack}
            className="-ml-1 mt-0.5"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-mist">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
    {children}
  </div>
);

/** White box with an optional heading row. */
export const Panel = ({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) => (
  <section
    className={cn(
      "rounded-xl border bg-white shadow-[0_1px_2px_hsl(var(--ink)/0.04)]",
      className
    )}
  >
    {(title || actions) && (
      <div className="flex items-start gap-4 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          {title && (
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-mist">{description}</p>
          )}
        </div>
        {actions && (
          <div className="-my-1 flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    )}
    <div className={cn("p-5", bodyClassName)}>{children}</div>
  </section>
);

/**
 * Settings-style block: what it is on the left, the fields on the right
 * (stacked on small screens).
 */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) => (
  <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
    <div>
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-mist">{description}</p>
      )}
    </div>
    <div className="min-w-0 rounded-xl border bg-white p-5 shadow-[0_1px_2px_hsl(var(--ink)/0.04)] sm:p-6">
      {children}
    </div>
  </section>
);

/** A row of key numbers in one bordered strip. */
export const StatStrip = ({
  items,
}: {
  items: { label: string; value: ReactNode; hint?: ReactNode }[];
}) => (
  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none">
    {items.map(({ label, value, hint }) => (
      <div
        key={label}
        className="bg-white px-5 py-4 [&:last-child:nth-child(odd)]:col-span-2 sm:[&:last-child:nth-child(odd)]:col-span-1"
      >
        <dt className="text-[13px] text-mist">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </dd>
        {hint && <dd className="mt-0.5 text-xs text-mist">{hint}</dd>}
      </div>
    ))}
  </dl>
);

const TONES = {
  success: "bg-[hsl(145_45%_93%)] text-[hsl(145_55%_24%)]",
  info: "bg-[hsl(215_60%_94%)] text-[hsl(215_55%_32%)]",
  warning: "bg-[hsl(40_80%_92%)] text-[hsl(30_75%_28%)]",
  neutral: "bg-secondary text-stone",
  muted: "border border-border text-mist",
} as const;
export type Tone = keyof typeof TONES;

/** Small pill with a coloured dot: "On view", "Hidden", "Draft"... */
export const StatusBadge = ({
  tone = "neutral",
  icon: IconComponent,
  children,
  className,
}: {
  tone?: Tone;
  icon?: Icon;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
      TONES[tone],
      className
    )}
  >
    {IconComponent ? (
      <IconComponent className="size-3.5" aria-hidden="true" />
    ) : (
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
    )}
    {children}
  </span>
);

/** Icon-only button with a tooltip; `danger` turns red on hover. */
export const IconAction = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    icon: Icon;
    tone?: "default" | "danger";
  }
>(
  (
    { label, icon: IconComponent, tone = "default", className, ...props },
    ref
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-mist transition-colors hover:bg-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
            tone === "danger" &&
              "hover:bg-[hsl(0_70%_96%)] hover:text-destructive",
            className
          )}
          {...props}
        >
          <IconComponent className="size-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1 text-xs">{label}</TooltipContent>
    </Tooltip>
  )
);
IconAction.displayName = "IconAction";

/** Asks before deleting. Renders a bin icon unless `trigger` is given. */
export const ConfirmDelete = ({
  title,
  description,
  onConfirm,
  confirmLabel = "Delete",
  trigger,
  disabled,
}: {
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  trigger?: ReactNode;
  disabled?: boolean;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild disabled={disabled}>
      {trigger ?? (
        <IconAction label={confirmLabel} icon={Trash2} tone="danger" />
      )}
    </AlertDialogTrigger>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className={buttonVariants({ variant: "destructive" })}
        >
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/** Shown instead of a list when there is nothing (yet, or after filtering). */
export const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: {
  icon?: Icon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-14 text-center",
      className
    )}
  >
    {IconComponent && (
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-secondary text-mist">
        <IconComponent className="size-5" />
      </div>
    )}
    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-mist">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const LoadingPanel = ({ label = "Loading…" }: { label?: string }) => (
  <div
    role="status"
    className="flex items-center justify-center gap-3 rounded-xl border bg-white py-16 text-sm text-mist"
  >
    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
    {label}
  </div>
);

/** Search box for the toolbar above a list. */
export const SearchField = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <div className={cn("relative min-w-0 flex-1", className)}>
    <Search
      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist"
      aria-hidden="true"
    />
    <Input
      type="search"
      aria-label={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white pl-9"
    />
  </div>
);

/** "Showing 4 of 12" with a reset link when filters are on. */
export const ResultCount = ({
  shown,
  total,
  noun,
  onClear,
}: {
  shown: number;
  total: number;
  noun: string;
  onClear?: () => void;
}) => (
  <div className="flex items-center gap-3 text-sm text-mist">
    <span aria-live="polite">
      {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
    </span>
    {onClear && (
      <button
        type="button"
        onClick={onClear}
        className="font-medium text-ink underline-offset-4 hover:underline"
      >
        Clear filters
      </button>
    )}
  </div>
);

/** Bordered list; put <ListRow>s inside. */
export const ListPanel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <ul
    className={cn(
      "divide-y overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_hsl(var(--ink)/0.04)]",
      className
    )}
  >
    {children}
  </ul>
);

export const ListRow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <li
    className={cn(
      "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[hsl(45_20%_98.5%)] sm:px-5",
      className
    )}
  >
    {children}
  </li>
);

/** Small image for list rows; falls back to a tinted box. */
export const Thumb = ({
  src,
  shape = "square",
  className,
}: {
  src?: string | null;
  shape?: "square" | "poster" | "round";
  className?: string;
}) => {
  const box = cn(
    "shrink-0 overflow-hidden bg-secondary",
    shape === "poster" && "h-14 w-11 rounded-md",
    shape === "square" && "size-12 rounded-md",
    shape === "round" && "size-10 rounded-full",
    className
  );
  const size =
    shape === "poster" ? { width: 88, height: 112 } : { width: 96, height: 96 };
  return src ? (
    <img
      src={imageUrl(src, { ...size, crop: "fill" })}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn(box, "object-cover")}
    />
  ) : (
    <div className={box} aria-hidden="true" />
  );
};

/** IconAction look for a link that opens in a new tab ("View on site"). */
export const IconLink = ({
  label,
  icon: IconComponent,
  href,
}: {
  label: string;
  icon: Icon;
  href: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-mist transition-colors hover:bg-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IconComponent className="size-4" aria-hidden="true" />
      </a>
    </TooltipTrigger>
    <TooltipContent className="px-2 py-1 text-xs">{label}</TooltipContent>
  </Tooltip>
);
