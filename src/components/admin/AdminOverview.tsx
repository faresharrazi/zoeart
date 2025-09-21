import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminOverview = () => {
  const stats = [
    {
      title: "Total Artworks",
      value: "6",
      change: "+2 this month",
      color: "text-blue-600",
    },
    {
      title: "Active Artists",
      value: "6",
      change: "All featured",
      color: "text-green-600",
    },
    {
      title: "Current Exhibitions",
      value: "1",
      change: "2 upcoming",
      color: "text-purple-600",
    },
    {
      title: "Page Sections",
      value: "6",
      change: "Fully managed",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Manage your gallery content from this centralized dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-elegant">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gallery-gold mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Overview */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gallery-light-grey rounded-lg">
            <div>
              <h4 className="font-semibold">Artworks</h4>
              <p className="text-sm text-muted-foreground">
                Add, edit, and manage gallery pieces
              </p>
            </div>
            <Badge variant="secondary">6 items</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gallery-light-grey rounded-lg">
            <div>
              <h4 className="font-semibold">Artists</h4>
              <p className="text-sm text-muted-foreground">
                Manage artist profiles and information
              </p>
            </div>
            <Badge variant="secondary">6 profiles</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gallery-light-grey rounded-lg">
            <div>
              <h4 className="font-semibold">Exhibitions</h4>
              <p className="text-sm text-muted-foreground">
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
