import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
const logoMenu = "/logo/logo-menu.PNG";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

const Navigation = () => {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pageData, loading, error } = usePageDataFromDB();

  // Debug logging
  console.log("Navigation render:", { pageData, loading, error });

  useEffect(() => {
    // Check if current domain contains "admin."
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsAdminSubdomain(hostname.includes("admin."));
    }
  }, []);

  // Helper function to check if a page is visible
  const isPageVisible = (pageName: string): boolean => {
    if (loading || !pageData) return true; // Show all pages while loading
    const page = pageData[pageName];
    return page ? Boolean(page.isVisible) : true;
  };

  // If there's an error loading page data, show a simple navigation
  if (error) {
    console.log("Navigation error fallback:", error);
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 relative shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-3">
                <img
                  src={logoMenu}
                  alt="Aether Art Space"
                  className="h-10 w-auto md:h-12 md:w-auto object-contain"
                />
                <span className="text-xl md:text-2xl  tracking-tight text-gray-900">
                  Aether Art Space
                </span>
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/exhibitions"
                className="text-gray-600 hover:text-gray-900"
              >
                Exhibitions
              </a>
              <a href="/artists" className="text-gray-600 hover:text-gray-900">
                Artists
              </a>
              <a
                href="/collection"
                className="text-gray-600 hover:text-gray-900"
              >
                Gallery
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // If loading or no page data, show a simple navigation
  if (loading || !pageData) {
    console.log("Navigation loading state or no page data:", {
      loading,
      pageData,
    });
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 relative shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-3">
                <img
                  src={logoMenu}
                  alt="Aether Art Space"
                  className="h-10 w-auto md:h-12 md:w-auto object-contain"
                />
                <span className="text-xl md:text-2xl  tracking-tight text-gray-900">
                  Aether Art Space
                </span>
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/exhibitions"
                className="text-gray-600 hover:text-gray-900"
              >
                Exhibitions
              </a>
              <a href="/artists" className="text-gray-600 hover:text-gray-900">
                Artists
              </a>
              <a
                href="/collection"
                className="text-gray-600 hover:text-gray-900"
              >
                Gallery
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-background border-b border-theme-border relative shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo - Left side */}
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
              <span className="text-xl md:text-2xl  tracking-tight text-theme-text-primary">
                Aether Art Space
              </span>
            </a>
          </div>

          {/* Menu and Mobile Button - Right side */}
          <div className="flex items-center space-x-8">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {isPageVisible("exhibitions") && (
                <a
                  href="/exhibitions"
                  className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                >
                  Exhibitions
                </a>
              )}
              {isPageVisible("artists") && (
                <a
                  href="/artists"
                  className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                >
                  Artists
                </a>
              )}
              {isPageVisible("gallery") && (
                <a
                  href="/collection"
                  className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                >
                  Gallery
                </a>
              )}
              {isPageVisible("about") && (
                <a
                  href="/about"
                  className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                >
                  About
                </a>
              )}
              {isPageVisible("contact") && (
                <a
                  href="/contact"
                  className="text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                >
                  Contact
                </a>
              )}
            </div>

            {/* Mobile Button */}
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
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-theme-background border-t border-theme-border shadow-lg">
            <div className="container mx-auto px-6 py-4 space-y-4">
              {isPageVisible("exhibitions") && (
                <a
                  href="/exhibitions"
                  className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Exhibitions
                </a>
              )}
              {isPageVisible("artists") && (
                <a
                  href="/artists"
                  className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Artists
                </a>
              )}
              {isPageVisible("gallery") && (
                <a
                  href="/collection"
                  className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Gallery
                </a>
              )}
              {isPageVisible("about") && (
                <a
                  href="/about"
                  className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
              )}
              {isPageVisible("contact") && (
                <a
                  href="/contact"
                  className="block text-theme-text-muted hover:text-theme-text-primary transition-smooth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
