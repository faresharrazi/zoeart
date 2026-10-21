import type { NewsletterSubscriber } from "@/types/api";
import { StatStrip } from "../AdminUI";

const DAY = 24 * 60 * 60 * 1000;

/** Key numbers about the mailing list. */
const NewsletterStats = ({
  subscribers,
}: {
  subscribers: NewsletterSubscriber[];
}) => {
  const active = subscribers.filter((s) => s.status !== "unsubscribed");
  const since = Date.now() - 30 * DAY;
  const recent = active.filter(
    (s) => new Date(s.subscribed_at).getTime() >= since
  );

  return (
    <StatStrip
      items={[
        { label: "Subscribers", value: active.length },
        { label: "New in the last 30 days", value: recent.length },
        {
          label: "Unsubscribed",
          value: subscribers.length - active.length,
        },
      ]}
    />
  );
};

export default NewsletterStats;
