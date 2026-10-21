import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import type { NewsletterSubscriber } from "@/types/api";
import { AdminPage, LoadingPanel } from "../AdminUI";
import NewsletterStats from "./NewsletterStats";
import SubscriberList from "./SubscriberList";

// Quote every field, and neutralise values a spreadsheet would run as a
// formula (subscribers choose their own name and email).
const csvField = (value: string) => {
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${text.replace(/"/g, '""')}"`;
};

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSubscribers = async (isRefresh = false) => {
    const setBusy = isRefresh ? setRefreshing : setLoading;
    setBusy(true);
    try {
      if (!localStorage.getItem("adminToken")) {
        console.error("No admin token found");
        return;
      }
      if (isRefresh) apiClient.clearCache();
      setSubscribers(await apiClient.getNewsletterSubscribers());
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setSubscribers([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = (id: number) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ["Email", "Name", "Status", "Subscribed At", "Source"],
        ...subscribers.map((subscriber) => [
          subscriber.email,
          subscriber.name || "",
          subscriber.status,
          new Date(subscriber.subscribed_at).toLocaleDateString(),
          subscriber.source || "",
        ]),
      ]
        .map((row) => row.map(csvField).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "List exported",
        description: `${subscribers.length} subscribers saved as a CSV file.`,
      });
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast({ title: "Couldn't export the list", variant: "destructive" });
    }
  };

  return (
    <AdminPage
      title="Newsletter"
      description="People who signed up on the website. Export the list to use it in your email tool."
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => fetchSubscribers(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || subscribers.length === 0}
          >
            <Download aria-hidden="true" />
            Export CSV
          </Button>
        </>
      }
    >
      {loading ? (
        <LoadingPanel label="Loading subscribers…" />
      ) : (
        <>
          <NewsletterStats subscribers={subscribers} />
          <SubscriberList subscribers={subscribers} onDelete={handleDelete} />
        </>
      )}
    </AdminPage>
  );
};

export default NewsletterManagement;
