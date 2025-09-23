import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Palette, Mail, TrendingUp } from "lucide-react";

const AdminOverview = () => {
  // Mock data - in a real app, this would come from your database
  const stats = [
    {
      title: "Upcoming Exhibitions",
      value: "2",
      change: "Next: Contemporary Visions 2024",
      color: "text-theme-primary",
      icon: Calendar,
    },
    {
      title: "Past Exhibitions",
      value: "1",
      change: "Recently completed",
      color: "text-theme-text-muted",
      icon: Calendar,
    },
    {
      title: "Active Artists",
      value: "6",
      change: "All featured",
      color: "text-theme-primary",
      icon: Users,
    },
    {
      title: "Artwork Collection",
      value: "12",
      change: "+3 this month",
      color: "text-theme-primary",
      icon: Palette,
    },
    {
      title: "Newsletter Subscribers",
      value: "247",
      change: "+12 this week",
      color: "text-theme-primary",
      icon: Mail,
    },
  ];

  // Mock data for the chart - in a real app, this would come from analytics
  const chartData = [
    { month: "Jan", subscribers: 180, exhibitions: 1 },
    { month: "Feb", subscribers: 195, exhibitions: 1 },
    { month: "Mar", subscribers: 210, exhibitions: 2 },
    { month: "Apr", subscribers: 225, exhibitions: 2 },
    { month: "May", subscribers: 235, exhibitions: 3 },
    { month: "Jun", subscribers: 247, exhibitions: 3 },
  ];

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
        {stats.map((stat, index) => {
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

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-theme-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Newsletter Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-theme-text-muted">{data.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-theme-primary rounded-full"></div>
                      <span className="text-sm text-theme-text-primary">{data.subscribers}</span>
                    </div>
                    <div className="w-20 bg-theme-surface rounded-full h-2">
                      <div 
                        className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.subscribers / 250) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-theme-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Exhibition Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-theme-text-muted">{data.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-theme-text-muted rounded-full"></div>
                      <span className="text-sm text-theme-text-primary">{data.exhibitions}</span>
                    </div>
                    <div className="w-20 bg-theme-surface rounded-full h-2">
                      <div 
                        className="bg-theme-text-muted h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.exhibitions / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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
            <Badge variant="secondary">12 items</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-theme-surface rounded-lg">
            <div>
              <h4 className="font-semibold text-theme-text-primary">Artists</h4>
              <p className="text-sm text-theme-text-muted">
                Manage artist profiles and information
              </p>
            </div>
            <Badge variant="secondary">6 profiles</Badge>
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
            <Badge variant="secondary">3 events</Badge>
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
            <Badge variant="secondary">247 subscribers</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
