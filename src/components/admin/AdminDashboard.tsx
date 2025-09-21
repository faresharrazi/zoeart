import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import ArtworkManagement from "./ArtworkManagement";
import ArtistManagement from "./ArtistManagement";
import ExhibitionManagement from "./ExhibitionManagement";
import PageContentManagement from "./PageContentManagement";
import MediaLibrary from "./MediaLibrary";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "artworks":
        return <ArtworkManagement />;
      case "artists":
        return <ArtistManagement />;
      case "exhibitions":
        return <ExhibitionManagement />;
      case "pages":
        return <PageContentManagement />;
      case "media":
        return <MediaLibrary />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gallery-light-grey flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
