import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import type { AnalyticsRange, AnalyticsSummary } from "@/types/api";
import {
  AdminPage,
  EmptyState,
  LoadingPanel,
  Panel,
  StatStrip,
} from "../AdminUI";
import ViewsChart from "./ViewsChart";

const RANGES: { value: AnalyticsRange; label: string; previous: string }[] = [
  { value: "7d", label: "7 days", previous: "previous 7 days" },
  { value: "30d", label: "30 days", previous: "previous 30 days" },
  { value: "90d", label: "90 days", previous: "previous 90 days" },
  { value: "12m", label: "12 months", previous: "previous 12 months" },
];

const number = new Intl.NumberFormat("en");
const compact = (n: number) =>
  n >= 10000
    ? new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)
    : number.format(n);
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code: string) => {
  try {
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
};

/** Change against the previous period; arrow and sign, not colour alone. */
const Delta = ({
  current,
  previous,
  period,
}: {
  current: number;
  previous: number;
  period: string;
}) => {
  if (previous === 0) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return <>Same as the {period}</>;
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium",
          up ? "text-[hsl(145_55%_26%)]" : "text-destructive"
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {up ? "+" : "−"}
        {Math.abs(change)}%
      </span>
      vs {period}
    </span>
  );
};

/** Ranked list with a bar for each value (one hue, longest = largest). */
const BarList = ({
  rows,
  emptyText,
}: {
  rows: {
    key: string;
    label: React.ReactNode;
    value: number;
    display?: React.ReactNode;
  }[];
  emptyText: string;
}) => {
  if (rows.length === 0) {
    return <p className="text-sm text-mist">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1.5">
          <div className="flex justify-between gap-4 text-sm">
            <span className="truncate text-ink">{row.label}</span>
            <span className="shrink-0 tabular-nums text-ink">
              {row.display ?? number.format(row.value)}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-1.5 rounded-r-full bg-ink"
            style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
          />
        </li>
      ))}
    </ul>
  );
};

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (selected: AnalyticsRange) => {
      setLoading(true);
      try {
        setData(await apiClient.getAnalytics(selected));
      } catch (error) {
        toast({
          title: "Couldn't load the statistics",
          description: errorMessage(error, "Please try again."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(range);
  }, [load, range]);

  const period = RANGES.find((r) => r.value === range)!.previous;
  const totals = data?.totals;
  const deviceTotal = data?.devices.reduce((sum, d) => sum + d.views, 0) ?? 0;

  const rangePicker = (
    <div className="flex items-center gap-3">
      {loading && data && (
        <Loader2
          className="size-4 animate-spin text-mist"
          aria-label="Loading"
        />
      )}
      <div
        className="inline-flex rounded-lg border bg-white p-0.5 shadow-[0_1px_2px_hsl(var(--ink)/0.04)]"
        role="group"
        aria-label="Period"
      >
        {RANGES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            aria-pressed={range === option.value}
            aria-label={`Last ${option.label}`}
            className={cn(
              "h-8 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              range === option.value
                ? "bg-ink text-paper"
                : "text-stone hover:bg-accent hover:text-ink"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AdminPage
      title="Analytics"
      description="Visits to the website, counted without cookies."
      actions={rangePicker}
    >
      {!data ? (
        loading && <LoadingPanel label="Loading statistics…" />
      ) : totals && totals.views === 0 && totals.previous_views === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No visits recorded yet"
          description="Statistics start from the day this feature went live."
        />
      ) : (
        <div
          className={cn(
            "space-y-6 transition-opacity",
            loading && "opacity-60"
          )}
        >
          {totals && (
            <StatStrip
              items={[
                {
                  label: "Page views",
                  value: compact(totals.views),
                  hint: (
                    <Delta
                      current={totals.views}
                      previous={totals.previous_views}
                      period={period}
                    />
                  ),
                },
                {
                  label: "Visitors",
                  value: compact(totals.visitors),
                  hint: (
                    <Delta
                      current={totals.visitors}
                      previous={totals.previous_visitors}
                      period={period}
                    />
                  ),
                },
                {
                  label: "Newsletter sign-ups",
                  value: number.format(totals.newsletter_signups),
                  hint: "In this period",
                },
                {
                  label: "On the site right now",
                  value: number.format(totals.visitors_now),
                  hint: "Visitors in the last 30 minutes",
                },
              ]}
            />
          )}

          <Panel title={`Page views per ${data.bucket}`}>
            <ViewsChart series={data.series} bucket={data.bucket} />
          </Panel>

          <Panel title="Most visited pages" bodyClassName="p-0">
            {data.pages.length === 0 ? (
              <p className="p-5 text-sm text-mist">No visits in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-mist">
                    <tr>
                      <th className="py-2.5 pl-5 pr-2 font-medium">Page</th>
                      <th className="w-px whitespace-nowrap px-3 py-2.5 text-right font-medium sm:px-5">
                        <span className="sm:hidden">Views</span>
                        <span className="hidden sm:inline">Page views</span>
                      </th>
                      <th className="w-px whitespace-nowrap py-2.5 pl-3 pr-5 text-right font-medium sm:pl-5">
                        Visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {data.pages.map((page) => (
                      <tr key={page.path} className="border-t">
                        <td className="py-2.5 pl-5 pr-2">
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words text-ink hover:underline"
                          >
                            {page.title}
                            <ExternalLink
                              className="ml-1.5 inline size-3 text-mist"
                              aria-hidden="true"
                            />
                          </a>
                          <span className="block break-all text-xs text-mist">
                            {page.path}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-ink sm:px-5">
                          {number.format(page.views)}
                        </td>
                        <td className="py-2.5 pl-3 pr-5 text-right text-stone sm:pl-5">
                          {number.format(page.visitors)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Where visitors come from">
              <BarList
                emptyText="No visits in this period."
                rows={data.sources.map((s) => ({
                  key: s.source,
                  label: s.source,
                  value: s.views,
                }))}
              />
            </Panel>

            <Panel title="Devices">
              <BarList
                emptyText="No visits in this period."
                rows={
                  deviceTotal === 0
                    ? []
                    : data.devices.map((d) => ({
                        key: d.device,
                        label: <span className="capitalize">{d.device}</span>,
                        value: d.views,
                        display: (
                          <>
                            <span className="font-medium">
                              {Math.round((d.views / deviceTotal) * 100)}%
                            </span>{" "}
                            <span className="text-mist">
                              ({number.format(d.views)})
                            </span>
                          </>
                        ),
                      }))
                }
              />
            </Panel>

            <Panel title="Countries">
              <BarList
                emptyText="Countries appear once the site is live on Vercel."
                rows={data.countries.map((c) => ({
                  key: c.country,
                  label: countryName(c.country),
                  value: c.views,
                }))}
              />
            </Panel>
          </div>

          <p className="max-w-3xl text-sm text-mist">
            How visits are counted: no cookies are used and no personal data is
            stored. A visitor is counted once per day, so someone who comes back
            on three different days counts as three visitors. Visits by search
            engine robots and by anyone logged in to this admin panel are not
            counted.
          </p>
        </div>
      )}
    </AdminPage>
  );
};

export default AnalyticsDashboard;
