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

interface AdminOverviewProps {
  onNavigate: (section: string) => void;
}

const AdminOverview = ({ onNavigate }: AdminOverviewProps) => {
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
      title: "Exhibitions",
      value: (stats.upcomingExhibitions + stats.pastExhibitions).toString(),
      change:
        stats.upcomingExhibitions + stats.pastExhibitions > 0
          ? `${stats.upcomingExhibitions} upcoming, ${stats.pastExhibitions} past`
          : "No exhibitions yet",
      color: "text-theme-primary",
      icon: Calendar,
      navigateTo: "exhibitions",
    },
    {
      title: "Artists",
      value: stats.artists.toString(),
      change: stats.artists > 0 ? "Featured artists" : "No artists yet",
      color: "text-theme-primary",
      icon: Users,
      navigateTo: "artists",
    },
    {
      title: "Artworks",
      value: stats.artworks.toString(),
      change: stats.artworks > 0 ? "Gallery pieces" : "No artworks yet",
      color: "text-theme-primary",
      icon: Palette,
      navigateTo: "artworks",
    },
    {
      title: "Newsletter",
      value: stats.subscribers.toString(),
      change:
        stats.subscribers > 0 ? "Active subscribers" : "No subscribers yet",
      color: "text-theme-primary",
      icon: Mail,
      navigateTo: "newsletter",
    },
    {
      title: "Page Content",
      value: "5",
      change: "Manage pages",
      color: "text-theme-primary",
      icon: TrendingUp,
      navigateTo: "pages",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl  mb-2 text-theme-text-primary">
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
        <h2 className="text-2xl  mb-2 text-theme-text-primary">
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
            <Card 
              key={index} 
              className="shadow-elegant cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105"
              onClick={() => onNavigate(stat.navigateTo)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm  text-theme-text-muted">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="w-4 h-4 text-theme-text-muted" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl  ${stat.color}`}>
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
    </div>
  );
};

export default AdminOverview;
