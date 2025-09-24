import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Search, Download, Trash2, Calendar, Filter } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source: string;
}

const NewsletterManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: 1,
      email: "john.doe@example.com",
      subscribedAt: "2024-01-15T10:30:00Z",
      status: "active",
      source: "Website",
    },
    {
      id: 2,
      email: "sarah.wilson@example.com",
      subscribedAt: "2024-01-20T14:45:00Z",
      status: "active",
      source: "Social Media",
    },
    {
      id: 3,
      email: "mike.chen@example.com",
      subscribedAt: "2024-02-03T09:15:00Z",
      status: "active",
      source: "Website",
    },
    {
      id: 4,
      email: "emma.rodriguez@example.com",
      subscribedAt: "2024-02-10T16:20:00Z",
      status: "unsubscribed",
      source: "Email Campaign",
    },
    {
      id: 5,
      email: "alex.thompson@example.com",
      subscribedAt: "2024-02-15T11:30:00Z",
      status: "active",
      source: "Website",
    },
    {
      id: 6,
      email: "luna.park@example.com",
      subscribedAt: "2024-02-20T13:45:00Z",
      status: "active",
      source: "Social Media",
    },
    {
      id: 7,
      email: "david.martinez@example.com",
      subscribedAt: "2024-03-01T08:00:00Z",
      status: "active",
      source: "Website",
    },
    {
      id: 8,
      email: "sophie.brown@example.com",
      subscribedAt: "2024-03-05T15:30:00Z",
      status: "active",
      source: "Referral",
    },
    {
      id: 9,
      email: "maria.garcia@example.com",
      subscribedAt: "2024-03-10T12:15:00Z",
      status: "active",
      source: "Website",
    },
    {
      id: 10,
      email: "james.wilson@example.com",
      subscribedAt: "2024-03-15T17:45:00Z",
      status: "active",
      source: "Social Media",
    },
  ]);
  const { toast } = useToast();

  // Filtering logic
  const filteredSubscribers = useMemo(() => {
    let filtered = subscribers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((subscriber) =>
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (subscriber) => subscriber.status === statusFilter
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((subscriber) => {
            const subDate = new Date(subscriber.subscribedAt);
            return subDate >= filterDate;
          });
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((subscriber) => {
            const subDate = new Date(subscriber.subscribedAt);
            return subDate >= filterDate;
          });
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((subscriber) => {
            const subDate = new Date(subscriber.subscribedAt);
            return subDate >= filterDate;
          });
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter((subscriber) => {
            const subDate = new Date(subscriber.subscribedAt);
            return subDate >= filterDate;
          });
          break;
      }
    }

    return filtered;
  }, [subscribers, searchTerm, statusFilter, dateFilter]);

  // Statistics
  const activeSubscribers = subscribers.filter((s) => s.status === "active");
  const unsubscribedCount = subscribers.filter(
    (s) => s.status === "unsubscribed"
  ).length;

  // Monthly subscription data for chart
  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((month, index) => {
      const count = subscribers.filter((subscriber) => {
        const subDate = new Date(subscriber.subscribedAt);
        return (
          subDate.getMonth() === index && subDate.getFullYear() === selectedYear
        );
      }).length;

      return { month, count };
    });

    return data;
  }, [subscribers, selectedYear]);

  // Get available years from subscriber data
  const availableYears = useMemo(() => {
    const years = new Set(
      subscribers.map((subscriber) =>
        new Date(subscriber.subscribedAt).getFullYear()
      )
    );
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [subscribers]);

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ["Email", "Subscription Date", "Status", "Source"],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.email,
        new Date(subscriber.subscribedAt).toLocaleDateString(),
        subscriber.status,
        subscriber.source,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredSubscribers.length} subscribers to CSV`,
    });
  };

  // Delete functionality
  const handleDelete = (id: number) => {
    setSubscribers(subscribers.filter((subscriber) => subscriber.id !== id));
    toast({
      title: "Subscriber Deleted",
      description: "The subscriber has been removed from the list",
    });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-theme-text-primary">
          Newsletter Management
        </h2>
        <p className="text-theme-text-muted">
          Manage your newsletter subscribers and campaigns
        </p>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Total Subscribers Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-elegant">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-muted flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Total Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme-primary">
                {subscribers.length}
              </div>
              <p className="text-sm text-theme-text-muted mt-1">
                All time subscribers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <div className="lg:col-span-3">
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-theme-text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Subscriptions
                </CardTitle>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-theme-text-muted">
                      {data.month}
                    </div>
                    <div className="flex-1 bg-theme-surface rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-theme-primary h-full transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (data.count /
                              Math.max(...monthlyData.map((d) => d.count))) *
                              100,
                            5
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="w-8 text-sm font-medium text-theme-text-primary">
                      {data.count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscriber List */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-theme-text-primary">
                Subscriber List ({filteredSubscribers.length} of{" "}
                {subscribers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme-border">
                  <th className="text-left py-3 px-4 font-medium text-theme-text-primary">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-theme-text-primary">
                    Date
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-theme-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-theme-border hover:bg-theme-surface/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-theme-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-theme-primary" />
                        </div>
                        <span className="font-medium text-theme-text-primary">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-theme-text-muted">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 h-8 w-8 text-theme-error hover:bg-theme-error/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Subscriber
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{subscriber.email}</strong>? This action
                              cannot be undone and will remove them from the
                              newsletter list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(subscriber.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Subscriber
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="border border-theme-border rounded-lg p-4 bg-theme-surface/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-theme-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-theme-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-theme-text-primary truncate">
                        {subscriber.email}
                      </p>
                      <p className="text-sm text-theme-text-muted">
                        {formatDate(subscriber.subscribedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 text-theme-error hover:bg-theme-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Subscriber
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{subscriber.email}</strong>? This action
                            cannot be undone and will remove them from the
                            newsletter list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subscriber.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Subscriber
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
              <p className="text-theme-text-muted">
                No subscribers found matching your search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterManagement;
