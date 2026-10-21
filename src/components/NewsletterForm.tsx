import { useId, useState } from "react";
import { apiClient, ApiError } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * Newsletter sign-up. `withName` adds an optional name field; `tone` matches
 * the background it sits on.
 */
const NewsletterForm = ({
  withName = false,
  tone = "light",
}: {
  withName?: boolean;
  tone?: "light" | "dark";
}) => {
  const { toast } = useToast();
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.subscribeToNewsletter(email, name || undefined);
      toast({
        title: "Thank you!",
        description: "You are now subscribed to our newsletter.",
      });
      setName("");
      setEmail("");
    } catch (error) {
      const alreadySubscribed =
        error instanceof ApiError && error.status === 409;
      toast({
        title: alreadySubscribed
          ? "Already subscribed"
          : "Something went wrong",
        description: alreadySubscribed
          ? "This email is already subscribed to our newsletter."
          : error instanceof ApiError && error.status === 400
            ? error.message
            : "We couldn't subscribe you. Please try again.",
        variant: alreadySubscribed ? "default" : "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dark = tone === "dark";
  const fieldClass = cn(
    "w-full bg-transparent border-0 border-b py-3 text-base outline-none transition-colors placeholder:opacity-60 focus:border-b-2",
    dark
      ? "border-paper/60 focus:border-paper text-paper"
      : "border-ink/40 focus:border-ink text-ink"
  );
  const labelClass = cn("text-sm", dark ? "text-paper/75" : "text-mist");

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-x-6 gap-y-5"
    >
      {withName && (
        <div className="flex-[1_1_200px] flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className={labelClass}>
            Name (optional)
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>
      )}
      <div className="flex-[1_1_240px] flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className={labelClass}>
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={100}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "h-12 px-7 text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          dark
            ? "bg-paper text-ink hover:bg-paper/85 focus-visible:ring-paper focus-visible:ring-offset-ink"
            : "bg-ink text-paper hover:bg-ink/85 focus-visible:ring-ink"
        )}
      >
        {submitting ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
};

export default NewsletterForm;
