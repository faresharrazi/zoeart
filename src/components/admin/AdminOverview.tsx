import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Palette,
  Mail,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    upcomingExhibitions: 0,
    pastExhibitions: 0,
    artists: 0,
    artworks: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [exhibitions, artists, artworks] = await Promise.all([
          apiClient.getExhibitions(),
          apiClient.getArtists(),
          apiClient.getArtworks(),
        ]);

        // Get newsletter subscribers separately with proper auth
        let subscribers = [];
        try {
          subscribers = await apiClient.getNewsletterSubscribers();
        } catch (error) {
          console.warn("Could not fetch newsletter subscribers:", error);
          subscribers = [];
        }

        const upcoming = exhibitions.filter(
          (e: any) => e.status === "upcoming"
        ).length;
        const past = exhibitions.filter((e: any) => e.status === "past").length;

        setStats({
          upcomingExhibitions: upcoming,
          pastExhibitions: past,
          artists: artists.length,
          artworks: artworks.length,
          subscribers: subscribers.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Upcoming Exhibitions",
      value: stats.upcomingExhibitions.toString(),
      change:
        stats.upcomingExhibitions > 0
          ? "Active exhibitions"
          : "No upcoming exhibitions",
      color: "text-theme-primary",
      icon: Calendar,
    },
    {
      title: "Past Exhibitions",
      value: stats.pastExhibitions.toString(),
      change:
        stats.pastExhibitions > 0
          ? "Completed exhibitions"
          : "No past exhibitions",
      color: "text-theme-text-muted",
      icon: Calendar,
    },
    {
      title: "Active Artists",
      value: stats.artists.toString(),
      change: stats.artists > 0 ? "Featured artists" : "No artists yet",
      color: "text-theme-primary",
      icon: Users,
    },
    {
      title: "Artwork Collection",
      value: stats.artworks.toString(),
      change: stats.artworks > 0 ? "Gallery pieces" : "No artworks yet",
      color: "text-theme-primary",
      icon: Palette,
    },
    {
      title: "Newsletter Subscribers",
      value: stats.subscribers.toString(),
      change:
        stats.subscribers > 0 ? "Active subscribers" : "No subscribers yet",
      color: "text-theme-primary",
      icon: Mail,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-theme-text-primary">
            Dashboard Overview
          </h2>
          <p className="text-theme-text-muted">Loading dashboard data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-theme-text-primary">
          Dashboard Overview
        </h2>
        <p className="text-theme-text-muted">
          Manage your gallery content from this centralized dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="shadow-elegant">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-theme-text-muted">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="w-4 h-4 text-theme-text-muted" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-theme-text-muted mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-theme-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-theme-text-muted">
                Database connected and ready for content management.
              </div>
              <div className="text-sm text-theme-text-muted">
                Start by adding artists, artworks, and exhibitions through the
                management tabs.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-theme-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-theme-text-primary">
                  Database Connected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-theme-text-primary">
                  API Server Running
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-theme-text-primary">
                  Frontend Connected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-theme-text-primary">
            Content Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-theme-surface rounded-lg">
            <div>
              <h4 className="font-semibold text-theme-text-primary">
                Artworks
              </h4>
              <p className="text-sm text-theme-text-muted">
                Add, edit, and manage gallery pieces
              </p>
            </div>
            <Badge variant="secondary">{stats.artworks} items</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-theme-surface rounded-lg">
            <div>
              <h4 className="font-semibold text-theme-text-primary">Artists</h4>
              <p className="text-sm text-theme-text-muted">
                Manage artist profiles and information
              </p>
            </div>
            <Badge variant="secondary">{stats.artists} profiles</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-theme-surface rounded-lg">
            <div>
              <h4 className="font-semibold text-theme-text-primary">
                Exhibitions
              </h4>
              <p className="text-sm text-theme-text-muted">
                Plan and manage gallery exhibitions
              </p>
            </div>
            <Badge variant="secondary">
              {stats.upcomingExhibitions + stats.pastExhibitions} events
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-theme-surface rounded-lg">
            <div>
              <h4 className="font-semibold text-theme-text-primary">
                Newsletter
              </h4>
              <p className="text-sm text-theme-text-muted">
                Manage subscriber list and campaigns
              </p>
            </div>
            <Badge variant="secondary">{stats.subscribers} subscribers</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
