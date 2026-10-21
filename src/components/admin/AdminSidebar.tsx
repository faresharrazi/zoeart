import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/api";
import { IconAction } from "./AdminUI";
import { SECTION_GROUPS, type SectionId } from "./adminSections";

interface AdminSidebarProps {
  active: SectionId;
  user: SessionUser | null;
  onLogout: () => void;
}

const Brand = () => (
  <Link to="/admin" className="flex items-center gap-3 rounded-md">
    <img
      src="/logo/logo-menu.png"
      alt=""
      width={245}
      height={144}
      className="h-6 w-auto"
    />
    <span className="leading-tight">
      <span className="block text-[13px] font-semibold tracking-tight text-ink">
        Aether Art Space
      </span>
      <span className="block text-xs text-mist">Admin</span>
    </span>
  </Link>
);

const SidebarContent = ({
  active,
  user,
  onLogout,
  onNavigate,
}: AdminSidebarProps & { onNavigate?: () => void }) => (
  <div className="flex h-full flex-col">
    <nav
      aria-label="Admin"
      className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
    >
      {SECTION_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-mist">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ id, label, icon: Icon }) => {
              const current = id === active;
              return (
                <li key={id}>
                  <Link
                    to={`/admin?section=${id}`}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      current
                        ? "bg-accent font-medium text-ink"
                        : "text-stone hover:bg-accent/60 hover:text-ink"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        current ? "text-ink" : "text-mist"
                      )}
                      aria-hidden="true"
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>

    <div className="space-y-1 border-t p-3">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-stone transition-colors hover:bg-accent/60 hover:text-ink"
      >
        <ExternalLink className="size-4 text-mist" aria-hidden="true" />
        View website
      </a>
      <div className="flex items-center gap-3 rounded-md px-3 py-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold uppercase text-paper"
          aria-hidden="true"
        >
          {user?.username?.charAt(0) || "?"}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-ink">
            {user?.username}
          </span>
          <span className="block truncate text-xs capitalize text-mist">
            {user?.role}
          </span>
        </span>
        <IconAction label="Sign out" icon={LogOut} onClick={onLogout} />
      </div>
    </div>
  </div>
);

/** Fixed sidebar on large screens; top bar with a slide-in menu below. */
const AdminSidebar = (props: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Brand />
        </div>
        <SidebarContent {...props} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-ml-1.5 inline-flex size-9 items-center justify-center rounded-md text-ink hover:bg-accent"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <Brand />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
              <Brand />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-1.5 inline-flex size-9 items-center justify-center rounded-md text-ink hover:bg-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
