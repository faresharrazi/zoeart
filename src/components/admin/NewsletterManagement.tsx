import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Download, Trash2, Eye } from "lucide-react";

const NewsletterManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock newsletter subscribers data - in a real app, this would come from your database
  const subscribers = [
    {
      id: 1,
      email: "john.doe@example.com",
      subscribedAt: "2024-01-15",
      status: "active",
      source: "Website",
    },
    {
      id: 2,
      email: "sarah.wilson@example.com",
      subscribedAt: "2024-01-20",
      status: "active",
      source: "Social Media",
    },
    {
      id: 3,
      email: "mike.chen@example.com",
      subscribedAt: "2024-02-03",
      status: "active",
      source: "Website",
    },
    {
      id: 4,
      email: "emma.rodriguez@example.com",
      subscribedAt: "2024-02-10",
      status: "unsubscribed",
      source: "Email Campaign",
    },
    {
      id: 5,
      email: "alex.thompson@example.com",
      subscribedAt: "2024-02-15",
      status: "active",
      source: "Website",
    },
    {
      id: 6,
      email: "luna.park@example.com",
      subscribedAt: "2024-02-20",
      status: "active",
      source: "Social Media",
    },
    {
      id: 7,
      email: "david.martinez@example.com",
      subscribedAt: "2024-03-01",
      status: "active",
      source: "Website",
    },
    {
      id: 8,
      email: "sophie.brown@example.com",
      subscribedAt: "2024-03-05",
      status: "active",
      source: "Referral",
    },
  ];

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscribers = subscribers.filter((s) => s.status === "active");
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;

  const handleExport = () => {
    // In a real app, this would export the subscriber list
    console.log("Exporting subscriber list...");
  };

  const handleDelete = (id: number) => {
    // In a real app, this would delete the subscriber from the database
    console.log(`Deleting subscriber ${id}...`);
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-muted flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-primary">
              {subscribers.length}
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              All time subscribers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-muted flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-primary">
              {activeSubscribers.length}
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Currently subscribed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-muted flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Unsubscribed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-text-muted">
              {unsubscribedCount}
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              No longer receiving emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber List */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-theme-text-primary">
              Subscriber List
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-4 bg-theme-surface rounded-lg hover:bg-theme-surface/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-theme-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-theme-text-primary">
                      {subscriber.email}
                    </p>
                    <p className="text-sm text-theme-text-muted">
                      Subscribed on {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={subscriber.status === "active" ? "default" : "secondary"}
                    className={
                      subscriber.status === "active"
                        ? "bg-theme-primary text-theme-primary-text"
                        : "bg-theme-text-muted text-white"
                    }
                  >
                    {subscriber.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {subscriber.source}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      onClick={() => console.log(`View ${subscriber.email}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 text-theme-error hover:bg-theme-error/10"
                      onClick={() => handleDelete(subscriber.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
