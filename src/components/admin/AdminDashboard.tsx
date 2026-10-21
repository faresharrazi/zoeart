import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import ArtworkManagement from "./artworks/ArtworkManagement";
import ArtistManagement from "./artists/ArtistManagement";
import ExhibitionManagement from "./exhibitions/ExhibitionManagement";
import ArticlesManagement from "./articles/ArticlesManagement";
import NewsletterManagement from "./newsletter/NewsletterManagement";
import PageContentManagement from "./page-content/PageContentManagement";
import UserManagement from "./UserManagement";
import UsefulLinks from "./UsefulLinks";

interface AdminDashboardProps {
  onLogout: () => void;
  user: any;
}

const AdminDashboard = ({ onLogout, user }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState("exhibitions");

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      onLogout();
    }
  }, [onLogout]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "artworks":
        return <ArtworkManagement />;
      case "artists":
        return <ArtistManagement />;
      case "exhibitions":
        return <ExhibitionManagement />;
      case "articles":
        return <ArticlesManagement />;
      case "newsletter":
        return <NewsletterManagement />;
      case "pages":
        return <PageContentManagement />;
      case "users":
        return <UserManagement />;
      case "links":
        return <UsefulLinks />;
      default:
        return <ExhibitionManagement />;
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
