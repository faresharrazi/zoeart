import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Palette,
  Users,
  Calendar,
  FileText,
  Image,
  Home,
  Menu,
  X,
  TestTube,
  Upload,
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
  { id: "pages", label: "Page Content", icon: FileText },
  { id: "media", label: "Media Library", icon: Image },
  { id: "test", label: "Database Test", icon: TestTube },
  { id: "media-test", label: "Upload Test", icon: Upload },
];

const AdminSidebar = ({
  activeSection,
  onSectionChange,
  onLogout,
}: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-background border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          )}
          <div className="flex items-center space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onLogout}
              className="text-xs px-2 py-1"
            >
              {isCollapsed ? "↪" : "Logout"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
            >
              {isCollapsed ? (
                <Menu className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed ? "px-2" : "px-4",
              activeSection === item.id &&
                "bg-gallery-gold text-foreground hover:bg-gallery-gold/90"
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="w-4 h-4" />
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
