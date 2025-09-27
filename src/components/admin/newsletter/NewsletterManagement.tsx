import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import NewsletterStats from "./NewsletterStats";
import SubscriberList from "./SubscriberList";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  subscribed_at: string;
  status: "active" | "unsubscribed";
  source: string;
}

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSubscribers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Check if user is authenticated
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        return;
      }

      // Clear cache if refreshing
      if (isRefresh) {
        apiClient.clearCache();
      }

      console.log(
        "Fetching newsletter subscribers with token:",
        token.substring(0, 20) + "..."
      );
      const data = await apiClient.getNewsletterSubscribers();
      console.log("Newsletter data received:", data);
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      // Don't show error toast immediately, just log it
      setSubscribers([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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
        .map((row) => row.map((field) => `"${field}"`).join(","))
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

      toast({
        title: "Success",
        description: "Subscribers exported successfully",
      });
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast({
        title: "Error",
        description: "Failed to export subscribers",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading subscribers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NewsletterStats
        onRefresh={() => fetchSubscribers(true)}
        onExport={handleExport}
        refreshing={refreshing}
      />

      <SubscriberList subscribers={subscribers} onDelete={handleDelete} />
    </div>
  );
};

export default NewsletterManagement;
