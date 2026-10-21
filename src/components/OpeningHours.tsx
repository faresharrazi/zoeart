import type { WorkingHour } from "@/hooks/useWorkingHours";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Show "Monday - Friday" as one row when all weekdays have the same hours.
const groupHours = (hours: WorkingHour[]): WorkingHour[] => {
  const weekdays = hours.filter((h) => WEEKDAYS.includes(h.day));
  const others = hours.filter((h) => !WEEKDAYS.includes(h.day));
  const sameWeekdayHours =
    weekdays.length === WEEKDAYS.length &&
    weekdays.every((h) => h.time_frame === weekdays[0].time_frame);

  return sameWeekdayHours
    ? [{ ...weekdays[0], id: "weekdays", day: "Monday - Friday" }, ...others]
    : hours;
};

// "10:00-14:00,17:00 - 20:00" -> one tidy range per line
const formatTimeFrame = (timeFrame: string) =>
  timeFrame
    .split(",")
    .map((part) =>
      part
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join("\n");

const OpeningHours = ({ hours }: { hours: WorkingHour[] }) => (
  <dl className="divide-y divide-white rounded-xl overflow-hidden">
    {groupHours(hours).map((hour) => {
      const isClosed = hour.time_frame?.toLowerCase().includes("closed");
      return (
        <div
          key={hour.id}
          className="flex justify-between items-center gap-4 p-4 bg-gray-50"
        >
          <dt className="font-semibold text-gray-900">{hour.day}</dt>
          <dd className="text-right">
            {isClosed ? (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                Closed
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-900 whitespace-pre-line">
                {formatTimeFrame(hour.time_frame || "")}
              </span>
            )}
          </dd>
        </div>
      );
    })}
  </dl>
);

export default OpeningHours;
