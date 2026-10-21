import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiClient, ApiError } from "@/lib/apiClient";

const NewsletterForm = () => {
  const { toast } = useToast();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="newsletter-name"
          className="block text-sm text-foreground mb-2"
        >
          Full Name
        </label>
        <Input
          id="newsletter-name"
          name="name"
          autoComplete="name"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label
          htmlFor="newsletter-email"
          className="block text-sm text-foreground mb-2"
        >
          Email Address <span aria-hidden="true">*</span>
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={100}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>

      <Button type="submit" className="w-full py-3" disabled={submitting}>
        {submitting ? "Subscribing…" : "Subscribe to Newsletter"}
      </Button>
    </form>
  );
};

export default NewsletterForm;
