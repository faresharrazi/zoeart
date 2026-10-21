import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage } from "@/lib/apiClient";
import type { AnalyticsRange, AnalyticsSummary } from "@/types/api";
import ViewsChart from "./ViewsChart";

const RANGES: { value: AnalyticsRange; label: string; previous: string }[] = [
  { value: "7d", label: "Last 7 days", previous: "previous 7 days" },
  { value: "30d", label: "Last 30 days", previous: "previous 30 days" },
  { value: "90d", label: "Last 90 days", previous: "previous 90 days" },
  { value: "12m", label: "Last 12 months", previous: "previous 12 months" },
];

// Dataviz reference palette: magnitude in one hue; devices are 3 categories
const BAR = "#2a78d6";
const DEVICE_COLORS = {
  mobile: "#2a78d6",
  desktop: "#eb6834",
  tablet: "#1baf7a",
};
const GOOD = "#006300";
const BAD = "#d03b3b";

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
  if (change === 0) {
    return <p className="text-sm text-theme-text-muted">Same as {period}</p>;
  }
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className="flex items-center gap-1 text-sm"
      style={{ color: up ? GOOD : BAD }}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>
        {up ? "+" : "−"}
        {Math.abs(change)}%
      </span>
      <span className="text-theme-text-muted">vs {period}</span>
    </p>
  );
};

const StatTile = ({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-5 space-y-1">
      <p className="text-sm text-theme-text-muted">{label}</p>
      <p className="text-3xl font-semibold text-theme-text-primary">{value}</p>
      {children}
    </CardContent>
  </Card>
);

/** Ranked list with a bar for each value (one hue, longest = largest). */
const BarList = ({
  rows,
  emptyText,
}: {
  rows: { key: string; label: React.ReactNode; value: number }[];
  emptyText: string;
}) => {
  if (rows.length === 0) {
    return <p className="text-sm text-theme-text-muted">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1">
          <div className="flex justify-between gap-4 text-sm">
            <span className="truncate">{row.label}</span>
            <span
              className="font-medium"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {number.format(row.value)}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-2 rounded-r"
            style={{
              width: `${Math.max(2, (row.value / max) * 100)}%`,
              background: BAR,
            }}
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
          title: "Error",
          description: errorMessage(error, "Failed to load statistics"),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-theme-text-primary">
          Analytics
        </h1>
        <p className="text-theme-text-muted">
          Visits to the website, without cookies.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Date range"
      >
        {RANGES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            aria-pressed={range === option.value}
            className={`px-4 py-2 rounded-md text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary ${
              range === option.value
                ? "bg-theme-primary text-white border-theme-primary"
                : "bg-white border-theme-border hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
        {loading && (
          <Loader2
            className="w-5 h-5 animate-spin self-center ml-2"
            aria-label="Loading"
          />
        )}
      </div>

      {!data ? null : totals &&
        totals.views === 0 &&
        totals.previous_views === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-theme-text-muted">
            No visits recorded yet. Statistics start from the day this feature
            went live.
          </CardContent>
        </Card>
      ) : (
        <div
          className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          {totals && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Page views" value={compact(totals.views)}>
                <Delta
                  current={totals.views}
                  previous={totals.previous_views}
                  period={period}
                />
              </StatTile>
              <StatTile label="Visitors" value={compact(totals.visitors)}>
                <Delta
                  current={totals.visitors}
                  previous={totals.previous_visitors}
                  period={period}
                />
              </StatTile>
              <StatTile
                label="Newsletter sign-ups"
                value={number.format(totals.newsletter_signups)}
              >
                <p className="text-sm text-theme-text-muted">in this period</p>
              </StatTile>
              <StatTile
                label="On the site right now"
                value={number.format(totals.visitors_now)}
              >
                <p className="text-sm text-theme-text-muted">
                  visitors in the last 30 minutes
                </p>
              </StatTile>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Page views per {data.bucket}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ViewsChart series={data.series} bucket={data.bucket} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most visited pages</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.pages.length === 0 ? (
                <p className="text-sm text-theme-text-muted">
                  No visits in this period.
                </p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-theme-text-muted">
                    <tr>
                      <th className="py-2 font-medium">Page</th>
                      <th className="py-2 font-medium text-right">
                        Page views
                      </th>
                      <th className="py-2 font-medium text-right">Visitors</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                    {data.pages.map((page) => (
                      <tr key={page.path} className="border-t border-black/5">
                        <td className="py-2 pr-4">
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {page.title}
                            <ExternalLink
                              className="w-3 h-3 text-theme-text-muted"
                              aria-hidden="true"
                            />
                          </a>
                          <span className="block text-xs text-theme-text-muted">
                            {page.path}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium">
                          {number.format(page.views)}
                        </td>
                        <td className="py-2 text-right">
                          {number.format(page.visitors)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Where visitors come from
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  emptyText="No visits in this period."
                  rows={data.sources.map((s) => ({
                    key: s.source,
                    label: s.source,
                    value: s.views,
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Devices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceTotal === 0 ? (
                  <p className="text-sm text-theme-text-muted">
                    No visits in this period.
                  </p>
                ) : (
                  <>
                    {/* One stacked bar, 2px white gaps between segments */}
                    <div className="flex h-4 gap-[2px]" aria-hidden="true">
                      {data.devices.map((d, i) => (
                        <div
                          key={d.device}
                          title={`${d.device}: ${number.format(d.views)}`}
                          className={`${i === 0 ? "rounded-l" : ""} ${
                            i === data.devices.length - 1 ? "rounded-r" : ""
                          }`}
                          style={{
                            width: `${(d.views / deviceTotal) * 100}%`,
                            background: DEVICE_COLORS[d.device],
                          }}
                        />
                      ))}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {data.devices.map((d) => (
                        <li
                          key={d.device}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="flex items-center gap-2 capitalize">
                            <span
                              aria-hidden="true"
                              className="w-3 h-3 rounded-sm"
                              style={{ background: DEVICE_COLORS[d.device] }}
                            />
                            {d.device}
                          </span>
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            <strong className="font-medium">
                              {Math.round((d.views / deviceTotal) * 100)}%
                            </strong>{" "}
                            <span className="text-theme-text-muted">
                              ({number.format(d.views)})
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  emptyText="Countries appear once the site is live on Vercel."
                  rows={data.countries.map((c) => ({
                    key: c.country,
                    label: countryName(c.country),
                    value: c.views,
                  }))}
                />
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-theme-text-muted max-w-3xl">
            How visits are counted: no cookies are used and no personal data is
            stored. A visitor is counted once per day, so someone who comes back
            on three different days counts as three visitors. Visits by search
            engine robots and by anyone logged in to this admin panel are not
            counted.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
