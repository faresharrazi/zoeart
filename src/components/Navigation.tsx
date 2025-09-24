import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoMenu from "@/assets/logo/Aether_art_space_menu_logo.png";

const Navigation = () => {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if current domain contains "admin."
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsAdminSubdomain(hostname.includes("admin."));
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-background/95 backdrop-blur-sm border-b border-theme-border">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={logoMenu}
                alt="Aether Art Space"
                className="h-10 w-auto md:h-12 md:w-auto object-contain"
              />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-theme-text-primary">
                Aether Art Space
              </span>
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/exhibitions"
              className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
            >
              Exhibitions
            </a>
            <a
              href="/artists"
              className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
            >
              Artists
            </a>
            <a
              href="/collection"
              className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
            >
              Gallery
            </a>
            <a
              href="/about"
              className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isAdminSubdomain && (
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/admin")}
              >
                Admin Login
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-theme-text-muted hover:text-theme-text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-theme-background/95 backdrop-blur-sm border-t border-theme-border">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <a
                href="/exhibitions"
                className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Exhibitions
              </a>
              <a
                href="/artists"
                className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artists
              </a>
              <a
                href="/collection"
                className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </a>
              <a
                href="/about"
                className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="/contact"
                className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
