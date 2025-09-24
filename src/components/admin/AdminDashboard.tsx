import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
// import { usePageHero } from "@/contexts/PageHeroContext";
import AdminOverview from "./AdminOverview";
import ArtworkManagement from "./ArtworkManagement";
import ArtistManagement from "./ArtistManagement";
import ExhibitionManagement from "./ExhibitionManagement";
import NewsletterManagement from "./NewsletterManagement";
import PageContentManagement from "./PageContentManagement";
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
      case "newsletter":
        return <NewsletterManagement />;
      case "pages":
        return <PageContentManagement />;
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
