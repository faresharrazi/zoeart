import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

const logoMenu = "/logo/logo-menu.png";

// `page` is the page_content entry whose visibility controls the link
const NAV_LINKS = [
  { to: "/exhibitions", label: "Exhibitions", page: "exhibitions" },
  { to: "/artists", label: "Artists", page: "artists" },
  { to: "/collection", label: "Gallery", page: "gallery" },
  { to: "/about", label: "About", page: "about" },
  { to: "/contact", label: "Contact", page: "contact" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-smooth hover:text-theme-text-primary ${
    isActive ? "text-theme-text-primary" : "text-theme-text-muted"
  }`;

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pageData } = usePageDataFromDB();
  const location = useLocation();
  const isAdminSubdomain = window.location.hostname.includes("admin.");

  // Close the mobile menu after navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Links stay visible until page settings say otherwise
  const links = NAV_LINKS.filter(
    ({ page }) => pageData[page]?.isVisible !== false
  );

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 bg-theme-background border-b border-theme-border shadow-sm"
    >
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={logoMenu}
              alt=""
              width={245}
              height={144}
              className="h-10 w-auto md:h-12 object-contain"
            />
            <span className="text-xl md:text-2xl tracking-tight text-theme-text-primary">
              Aether Art Space
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <ul className="hidden md:flex items-center space-x-8">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={linkClass}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-4">
              {isAdminSubdomain && (
                <Button variant="outline" asChild>
                  <Link to="/admin">Admin Login</Link>
                </Button>
              )}

              <button
                type="button"
                className="md:hidden p-2 text-theme-text-muted hover:text-theme-text-primary"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <ul
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 right-0 z-50 bg-theme-background border-t border-theme-border shadow-lg container mx-auto px-6 py-4 space-y-4"
          >
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={(state) => `block ${linkClass(state)}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
