import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fieldClass, toolButtonClass } from "./filterStyles";

// Radix Select items can't have an empty value
const ALL = "all";

export const FilterSearch = ({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={id} className="text-sm text-mist">
      Search
    </label>
    <div className="relative">
      <Search
        className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-mist"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          fieldClass,
          "w-full pl-7 text-base outline-none placeholder:text-mist/80 [&::-webkit-search-cancel-button]:appearance-none"
        )}
      />
    </div>
  </div>
);

/**
 * Dropdown filter. "" means no filter and shows as "All", unless `allLabel`
 * is null (a choice that always has a value, like the sort order).
 */
export const FilterSelect = ({
  id,
  label,
  value,
  options,
  onChange,
  allLabel = "All",
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  allLabel?: string | null;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm text-mist">
      {label}
    </label>
    <Select
      value={allLabel === null ? value : value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger id={id} className={fieldClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allLabel !== null && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

/**
 * Result count and "Clear filters" on the left; a Search button that shows or
 * hides the filters (`children`) and any other controls (`actions`) on the
 * right. The filters start closed, or open when the URL already has some so
 * visitors can see why the list is filtered. Closing keeps the filters on.
 */
export const FilterBar = ({
  id,
  summary,
  isFiltered,
  onClear,
  actions,
  children,
}: {
  id: string;
  summary: ReactNode;
  isFiltered: boolean;
  onClear: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(isFiltered);
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = `${id}-filters`;

  // Opened by the visitor: put them straight in the search box
  useEffect(() => {
    if (open && focusOnOpen) panelRef.current?.querySelector("input")?.focus();
  }, [open, focusOnOpen]);

  const toggle = () => {
    setFocusOnOpen(!open);
    setOpen(!open);
  };

  return (
    <div className="border-t border-line pt-6 md:pt-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
          <p className="text-sm text-mist" role="status" aria-live="polite">
            {summary}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-sm border-b border-ink pb-0.5 hover:text-stone"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            ref={toggleRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className={cn(toolButtonClass(open), "relative")}
          >
            {open ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Search className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="sr-only sm:not-sr-only">Search</span>
            {isFiltered && !open && (
              <span
                className="absolute right-1.5 top-2 size-1.5 rounded-full bg-ink"
                aria-hidden="true"
              />
            )}
          </button>
          {actions && (
            <>
              <span className="mx-1.5 h-6 w-px bg-line" aria-hidden="true" />
              {actions}
            </>
          )}
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          onKeyDown={(e) => {
            // Esc closes the filters, but not while a dropdown (rendered
            // outside the panel) is open
            if (
              e.key === "Escape" &&
              panelRef.current?.contains(e.target as Node)
            ) {
              setOpen(false);
              toggleRef.current?.focus();
            }
          }}
          className="mt-6 animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          {children}
        </div>
      )}
    </div>
  );
};
