import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            <a href="/" className="hover:text-gallery-gold transition-smooth">
              Aether Art Space
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/exhibitions"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              Exhibitions
            </a>
            <a
              href="/artists"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              Artists
            </a>
            <a
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isAdminSubdomain && (
              <Button
                variant="outline"
                className="hover:bg-gallery-gold hover:text-foreground hover:border-gallery-gold transition-smooth"
                onClick={() => (window.location.href = "/admin")}
              >
                Admin Login
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
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
          <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <a
                href="/exhibitions"
                className="block text-muted-foreground hover:text-foreground transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Exhibitions
              </a>
              <a
                href="/artists"
                className="block text-muted-foreground hover:text-foreground transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artists
              </a>
              <a
                href="/about"
                className="block text-muted-foreground hover:text-foreground transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="/contact"
                className="block text-muted-foreground hover:text-foreground transition-smooth"
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
