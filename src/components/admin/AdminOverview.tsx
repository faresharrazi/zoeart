import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminOverview = () => {
  const stats = [
    {
      title: "Total Artworks",
      value: "6",
      change: "+2 this month",
      color: "text-theme-primary",
    },
    {
      title: "Active Artists",
      value: "6",
      change: "All featured",
      color: "text-theme-primary",
    },
    {
      title: "Current Exhibitions",
      value: "1",
      change: "2 upcoming",
      color: "text-theme-primary",
    },
    {
      title: "Page Sections",
      value: "6",
      change: "Fully managed",
      color: "text-theme-primary",
    },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-elegant">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-muted">
                {stat.title}
              </CardTitle>
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
        ))}
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
            <Badge variant="secondary">6 items</Badge>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
