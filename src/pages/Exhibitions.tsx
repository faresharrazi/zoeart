import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, LayoutList, List, Search, X } from "lucide-react";
import type { ExhibitionSummary } from "@/components/ExhibitionCard";
import ExhibitionList from "@/components/ExhibitionList";
import {
  Container,
  LoadingState,
  PageHeader,
  PageLayout,
} from "@/components/PageLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import { byStartDateDesc } from "@/lib/dates";
import {
  EXHIBITION_VIEWS,
  exhibitionYears,
  filterExhibitions,
  type ExhibitionFilters,
  type ExhibitionView,
} from "@/lib/exhibitions";
import { cn } from "@/lib/utils";
import type { ExhibitionStatus } from "@/types/api";

// Radix Select items can't have an empty value
const ALL = "all";

// Underlined fields, matching the site's forms
const fieldClass =
  "h-11 rounded-none border-0 border-b border-ink/40 bg-transparent px-0 shadow-none focus:border-ink focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0";

const STATUS_OPTIONS: { value: ExhibitionStatus; label: string }[] = [
  { value: "current", label: "On view now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const VIEW_ICONS = { grid: LayoutGrid, cards: LayoutList, list: List };

const FilterSelect = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm text-mist">
      {label}
    </label>
    <Select
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger id={id} className={fieldClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="pt-8 pb-12 md:pt-10 md:pb-16">
    <h2 className="font-medium text-3xl md:text-4xl mb-10">{title}</h2>
    {children}
  </section>
);

const Exhibitions = () => {
  const { pageData } = usePageDataFromDB();
  const { data: exhibitions = [], loading } = useApi(
    () => apiClient.getExhibitions(),
    []
  );
  const title = pageData.exhibitions?.title?.trim() || "Exhibitions";
  useSeo({ title, description: pageData.exhibitions?.description });

  // Search, filters and layout live in the URL, so a view can be shared
  const [params, setParams] = useSearchParams();
  const statusParam = params.get("status") || "";
  const filters: ExhibitionFilters = {
    q: params.get("q") || "",
    status: STATUS_OPTIONS.some((o) => o.value === statusParam)
      ? (statusParam as ExhibitionStatus)
      : "",
    year: params.get("year") || "",
  };
  const viewParam = params.get("view") || "";
  const view: ExhibitionView =
    viewParam in EXHIBITION_VIEWS ? (viewParam as ExhibitionView) : "grid";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && !(key === "view" && value === "grid")) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const isFiltered = Boolean(filters.q || filters.status || filters.year);
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (view !== "grid") next.set("view", view);
    setParams(next, { replace: true });
  };

  const years = useMemo(() => exhibitionYears(exhibitions), [exhibitions]);
  const results = useMemo(
    () => filterExhibitions(exhibitions, filters),
    // filters is derived from params
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exhibitions, params.toString()]
  );

  const withStatus = (status: ExhibitionStatus) =>
    results.filter((e) => e.status === status).sort(byStartDateDesc);
  const current = withStatus("current");
  const upcoming = withStatus("upcoming").reverse(); // soonest first
  const past = withStatus("past");

  // Archive grouped by the year each exhibition opened (except in the list,
  // which shows dates on every row)
  const archiveYears = new Map<string, ExhibitionSummary[]>();
  for (const exhibition of past) {
    const year = exhibition.start_date?.slice(0, 4) || "Undated";
    archiveYears.set(year, [...(archiveYears.get(year) || []), exhibition]);
  }

  return (
    <PageLayout>
      <PageHeader
        title={title}
        description={
          pageData.exhibitions?.description && (
            <p>{pageData.exhibitions.description}</p>
          )
        }
      />

      <Container>
        {loading ? (
          <LoadingState label="Loading exhibitions…" />
        ) : exhibitions.length === 0 ? (
          <p className="border-t border-line py-20 text-mist">
            No exhibitions to show yet.
          </p>
        ) : (
          <>
            <div className="border-t border-line pt-8 md:pt-10 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto] md:gap-x-8 md:items-end">
              <form
                role="search"
                aria-label="Search exhibitions"
                onSubmit={(e) => e.preventDefault()}
                className="col-span-2 md:col-span-1"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="exhibition-search"
                    className="text-sm text-mist"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-mist"
                      aria-hidden="true"
                    />
                    <input
                      id="exhibition-search"
                      type="search"
                      value={filters.q}
                      onChange={(e) => setParam("q", e.target.value)}
                      placeholder="Title, place, curator…"
                      className={cn(
                        fieldClass,
                        "w-full pl-7 text-base outline-none placeholder:text-mist/80"
                      )}
                    />
                  </div>
                </div>
              </form>
              <FilterSelect
                id="filter-status"
                label="Status"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(v) => setParam("status", v)}
              />
              <FilterSelect
                id="filter-year"
                label="Year"
                value={filters.year}
                options={years.map((y) => ({ value: y, label: y }))}
                onChange={(v) => setParam("year", v)}
              />
              <div
                role="group"
                aria-label="Layout"
                className="col-span-2 flex gap-1 md:col-span-1"
              >
                {(Object.keys(EXHIBITION_VIEWS) as ExhibitionView[]).map(
                  (option) => {
                    const Icon = VIEW_ICONS[option];
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setParam("view", option)}
                        aria-pressed={view === option}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                          view === option
                            ? "bg-ink text-paper"
                            : "text-stone hover:text-ink hover:bg-sand"
                        )}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        {EXHIBITION_VIEWS[option]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex min-h-10 items-center justify-between gap-4 mt-6">
              <p className="text-sm text-mist" role="status" aria-live="polite">
                {isFiltered
                  ? `${results.length} of ${exhibitions.length} exhibitions`
                  : `${exhibitions.length} exhibitions`}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm border-b border-ink pb-0.5 hover:text-stone"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <p className="py-20 text-mist">
                No exhibitions match these filters.
              </p>
            ) : (
              <>
                {current.length > 0 && (
                  <Section title="On view now">
                    <ExhibitionList exhibitions={current} view={view} />
                  </Section>
                )}
                {upcoming.length > 0 && (
                  <Section title="Upcoming">
                    <ExhibitionList exhibitions={upcoming} view={view} />
                  </Section>
                )}
                {past.length > 0 && (
                  <Section title="Archive">
                    {view === "list" ? (
                      <ExhibitionList exhibitions={past} view={view} />
                    ) : (
                      <div className="space-y-16">
                        {[...archiveYears].map(([year, items]) => (
                          <div key={year}>
                            <h3 className="eyebrow text-mist mb-8">{year}</h3>
                            <ExhibitionList exhibitions={items} view={view} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
};

export default Exhibitions;
