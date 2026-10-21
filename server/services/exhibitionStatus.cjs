// An exhibition's status follows its dates, in the gallery's time zone:
// upcoming before it opens, current while it runs, past once it has closed.
// Without a closing date it counts as a one-day event. The status chosen in
// the admin is only used when there are no dates at all.
const GALLERY_TIME_ZONE = "Europe/Athens";

/** Today's date in Athens as YYYY-MM-DD, the format dates are stored in. */
const todayInAthens = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: GALLERY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

const statusFromDates = (
  { start_date, end_date, status },
  today = todayInAthens()
) => {
  if (!start_date) return status;
  const closes = end_date && end_date >= start_date ? end_date : start_date;
  if (today < start_date) return "upcoming";
  if (today <= closes) return "current";
  return "past";
};

module.exports = { statusFromDates, todayInAthens };
