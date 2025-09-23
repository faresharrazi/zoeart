import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
// import { usePageHero } from "@/contexts/PageHeroContext";
import AdminOverview from "./AdminOverview";
import ArtworkManagement from "./ArtworkManagement";
import ArtistManagement from "./ArtistManagement";
import ExhibitionManagement from "./ExhibitionManagement";
import PageContentManagement from "./PageContentManagement";
import MediaLibrary from "./MediaLibrary";
import PageHeroConfig from "./PageHeroConfig";
// import ThemeControl from "./ThemeControl"; // Removed theme management

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState("overview");
  // const { heroBackgrounds, setHeroBackground } = usePageHero();

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
      case "navigation":
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
              Page Background Configuration
            </h2>
            <p className="text-theme-text-muted">
              This feature is temporarily disabled. Background images will be
              configurable soon.
            </p>
          </div>
        );
      // case "theme":
      //   return <ThemeControl />; // Removed theme management
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-theme-background flex flex-col lg:flex-row">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6">{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
