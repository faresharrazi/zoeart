import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { cn } from "@/lib/utils";

// `page` is the page_content entry whose visibility controls the link
const NAV_LINKS = [
  { to: "/exhibitions", label: "Exhibitions", page: "exhibitions" },
  { to: "/artists", label: "Artists", page: "artists" },
  { to: "/collection", label: "Collection", page: "gallery" },
  { to: "/about", label: "About", page: "about" },
  { to: "/contact", label: "Contact", page: "contact" },
];

/**
 * Site menu. With `overlay` it sits transparent over the home page's photo
 * and turns solid once the visitor scrolls.
 */
const Navigation = ({ overlay = false }: { overlay?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pageData } = usePageDataFromDB();
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  // Lock page scroll behind the open phone menu
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = NAV_LINKS.filter(
    ({ page }) => pageData[page]?.isVisible !== false
  );
  // admin.<domain> shows a shortcut to the admin panel
  if (window.location.hostname.startsWith("admin.")) {
    links.push({ to: "/admin", label: "Admin", page: "admin" });
  }
  const transparent = overlay && !scrolled && !menuOpen;

  return (
    <>
      <header
        className={cn(
          "top-0 inset-x-0 z-50 transition-colors duration-300",
          overlay ? "fixed" : "sticky",
          transparent
            ? "bg-transparent text-white"
            : "bg-paper/95 text-ink backdrop-blur border-b border-line"
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto max-w-[1360px] px-6 md:px-10 h-[72px] flex items-center justify-between gap-4"
        >
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <img
              src={
                transparent
                  ? "/logo/logo-menu-white.png"
                  : "/logo/logo-menu.png"
              }
              alt=""
              width={245}
              height={144}
              className="h-6 w-auto shrink-0 sm:h-7"
            />
            <span className="whitespace-nowrap text-[12px] font-medium tracking-[0.2em] sm:text-[13px] sm:tracking-[0.24em]">
              AETHER ART SPACE
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-9">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "text-[13px] uppercase tracking-[0.1em] py-1 border-b transition-colors",
                      isActive
                        ? "border-current"
                        : "border-transparent hover:border-current"
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="lg:hidden shrink-0 -mr-2 p-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-current"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </nav>
      </header>

      {/* Outside the header: its backdrop blur would make "fixed" relative to
        the 72px header instead of the window */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-50 bg-paper text-ink overflow-y-auto"
        >
          <ul className="mx-auto max-w-[1360px] px-6 md:px-10 pt-4">
            {links.map(({ to, label }) => (
              <li key={to} className="border-b border-line">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between py-4 text-sm uppercase tracking-[0.12em]",
                      isActive
                        ? "text-ink font-medium"
                        : "text-stone hover:text-ink"
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navigation;
