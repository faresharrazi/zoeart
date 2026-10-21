import { useEffect, useRef, useState } from "react";
import type { AnalyticsSummary } from "@/types/api";

// Colors from the dataviz reference palette (single series: blue)
const BAR = "#2a78d6";
const BAR_ACTIVE = "#5598e7";
const GRID = "#e1e0d9";
const BASELINE = "#c3c2b7";
const AXIS_TEXT = "#6a707c";

const HEIGHT = 240;
const PAD = { top: 12, right: 8, bottom: 28, left: 44 };

type Point = AnalyticsSummary["series"][number];

const number = new Intl.NumberFormat("en");
const compact = new Intl.NumberFormat("en", { notation: "compact" });

const parseDay = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatBucket = (
  date: string,
  bucket: AnalyticsSummary["bucket"],
  long = false
) => {
  const day = parseDay(date);
  if (bucket === "month") {
    return day.toLocaleDateString("en-GB", {
      month: long ? "long" : "short",
      year: long ? "numeric" : undefined,
    });
  }
  const label = day.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: long ? "numeric" : undefined,
  });
  return bucket === "week" && long ? `Week of ${label}` : label;
};

// Round the axis up to a clean number with four even steps
const niceScale = (max: number) => {
  if (max <= 0) return { top: 4, step: 1 };
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= raw) ??
    10 * magnitude;
  return { top: Math.ceil(max / step) * step, step };
};

// Column with a 4px rounded data end, square at the baseline
const columnPath = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** Page views per day, week or month, with visitors in the tooltip. */
const ViewsChart = ({
  series,
  bucket,
}: {
  series: Point[];
  bucket: AnalyticsSummary["bucket"];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, entry.contentRect.width))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const { top, step } = niceScale(Math.max(0, ...series.map((p) => p.views)));
  const ticks = Array.from(
    { length: Math.round(top / step) + 1 },
    (_, i) => i * step
  );
  const band = plotW / Math.max(series.length, 1);
  const barW = Math.min(24, band * 0.7);
  const labelEvery = Math.ceil(
    series.length / Math.max(1, Math.floor(plotW / 64))
  );
  const yOf = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const activePoint = active !== null ? series[active] : null;
  const tooltipLeft =
    active !== null
      ? Math.min(Math.max(PAD.left + band * (active + 0.5), 80), width - 80)
      : 0;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setActive((i) => {
      const current = i ?? series.length - 1;
      const next = current + (e.key === "ArrowRight" ? 1 : -1);
      return Math.min(series.length - 1, Math.max(0, next));
    });
  };

  return (
    <div>
      <div
        ref={containerRef}
        className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary rounded"
        tabIndex={0}
        role="group"
        aria-label="Page views chart. Use the left and right arrow keys to read each value."
        onKeyDown={onKeyDown}
        onFocus={() => setActive((i) => i ?? series.length - 1)}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        <svg width={width} height={HEIGHT} aria-hidden="true" className="block">
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke={tick === 0 ? BASELINE : GRID}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yOf(tick)}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill={AXIS_TEXT}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {compact.format(tick)}
              </text>
            </g>
          ))}

          {series.map((point, i) => {
            const x = PAD.left + band * i + (band - barW) / 2;
            const h = (point.views / top) * plotH;
            return (
              <g key={point.date}>
                {h > 0 && (
                  <path
                    d={columnPath(x, PAD.top + plotH - h, barW, h)}
                    fill={i === active ? BAR_ACTIVE : BAR}
                  />
                )}
                {i % labelEvery === 0 && (
                  <text
                    x={PAD.left + band * (i + 0.5)}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill={AXIS_TEXT}
                  >
                    {formatBucket(point.date, bucket)}
                  </text>
                )}
                {/* Hit area: the whole column of the plot, not just the bar */}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setActive(i)}
                />
              </g>
            );
          })}
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-black/10 bg-white px-3 py-2 shadow-md text-sm whitespace-nowrap"
            style={{ left: tooltipLeft }}
            role="status"
          >
            <p className="text-xs text-theme-text-muted">
              {formatBucket(activePoint.date, bucket, true)}
            </p>
            <p className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-0.5 rounded"
                style={{ background: BAR }}
              />
              <strong className="font-semibold">
                {number.format(activePoint.views)}
              </strong>
              <span className="text-theme-text-muted">page views</span>
            </p>
            <p className="pl-5">
              <strong className="font-semibold">
                {number.format(activePoint.visitors)}
              </strong>{" "}
              <span className="text-theme-text-muted">visitors</span>
            </p>
          </div>
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-theme-text-muted hover:text-theme-text-primary">
          Show as a table
        </summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead className="text-theme-text-muted">
              <tr>
                <th className="py-1 font-medium">Period</th>
                <th className="py-1 font-medium text-right">Page views</th>
                <th className="py-1 font-medium text-right">Visitors</th>
              </tr>
            </thead>
            <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
              {series.map((point) => (
                <tr key={point.date} className="border-t border-black/5">
                  <td className="py-1">
                    {formatBucket(point.date, bucket, true)}
                  </td>
                  <td className="py-1 text-right">
                    {number.format(point.views)}
                  </td>
                  <td className="py-1 text-right">
                    {number.format(point.visitors)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default ViewsChart;
