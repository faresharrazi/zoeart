import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Palette,
  Users,
  Calendar,
  FileText,
  Home,
  Menu,
  X,
  Mail,
  // Settings, // Removed theme management
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "artworks", label: "Artworks", icon: Palette },
  { id: "artists", label: "Artists", icon: Users },
  { id: "exhibitions", label: "Exhibitions", icon: Calendar },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "pages", label: "Page Content", icon: FileText },
  // { id: "theme", label: "Theme Control", icon: Settings }, // Removed theme management
];

const AdminSidebar = ({
  activeSection,
  onSectionChange,
  onLogout,
}: AdminSidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-theme-surface border-b border-theme-border p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-theme-text-primary">
          Admin Panel
        </h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-xs px-3 py-1 border-theme-error text-theme-error hover:bg-theme-error hover:text-white"
          >
            Logout
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64 bg-theme-surface border-r border-theme-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-theme-border">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-theme-text-primary">
                  Admin Panel
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start px-4",
                    activeSection === item.id &&
                      "bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover"
                  )}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="ml-3">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-theme-surface border-r border-theme-border">
        <div className="p-4 border-b border-theme-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-theme-text-primary">
              Admin Panel
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-xs px-3 py-1 border-theme-error text-theme-error hover:bg-theme-error hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start px-4",
                activeSection === item.id &&
                  "bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="w-4 h-4" />
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
