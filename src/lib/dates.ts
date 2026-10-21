// Exhibition dates come from the API as "YYYY-MM-DD". Parse them as local
// calendar dates so they don't shift by a day in other time zones.
const parseDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** "March 3, 2026 - April 10, 2026", or whichever end is known. */
export const formatDateRange = (
  start: string | null | undefined,
  end: string | null | undefined
) => {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from && to && from !== to) return `${from} - ${to}`;
  return from || to;
};

/** Sort helper: most recent start date first, undated last. */
export const byStartDateDesc = (
  a: { start_date?: string | null },
  b: { start_date?: string | null }
) => (b.start_date || "").localeCompare(a.start_date || "");
