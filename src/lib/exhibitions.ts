/** Badge text and colours for each exhibition status. */
export const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming Exhibition",
    className: "bg-blue-100 text-blue-800",
  },
  current: {
    label: "Current Exhibition",
    className: "bg-green-100 text-green-800",
  },
  past: { label: "Past Exhibition", className: "bg-gray-100 text-gray-800" },
};
