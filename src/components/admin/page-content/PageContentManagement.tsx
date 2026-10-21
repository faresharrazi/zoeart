import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient, errorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import {
  AdminPage,
  EmptyState,
  IconLink,
  LoadingPanel,
  Panel,
} from "../AdminUI";
import HeroImageUpload from "../HeroImageUpload";
import AboutBlocksEditor from "./AboutBlocksEditor";
import PageTextForm from "./PageTextForm";

/** The website's pages, in menu order. Optional pages can be hidden. */
const PAGES = [
  {
    id: "home",
    label: "Home",
    path: "/",
    hideable: false,
    titleLabel: "Title",
    descriptionLabel: "Tagline",
    hint: "The large title over the photos and the tagline below it. Only the tagline's first line is shown, there and in the footer.",
  },
  {
    id: "exhibitions",
    label: "Exhibitions",
    path: "/exhibitions",
    hideable: false,
    titleLabel: "Title",
    descriptionLabel: "Introduction",
    hint: "The heading and introduction at the top of the Exhibitions page.",
  },
  {
    id: "artists",
    label: "Artists",
    path: "/artists",
    hideable: true,
    titleLabel: "Title",
    descriptionLabel: "Introduction",
    hint: "The heading and introduction at the top of the Artists page.",
  },
  {
    id: "gallery",
    label: "Collection",
    path: "/collection",
    hideable: true,
    titleLabel: "Title",
    descriptionLabel: "Introduction",
    hint: "The heading and introduction at the top of the Collection page.",
  },
  {
    id: "about",
    label: "About",
    path: "/about",
    hideable: true,
    titleLabel: "Title",
    descriptionLabel: "Introduction",
    descriptionRows: 6,
    hint: "The heading and introduction of the About page. The introduction is also shown on the home page.",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
    hideable: false,
    titleLabel: "Title",
    descriptionLabel: "Introduction",
    hint: "The heading and introduction at the top of the Contact page.",
  },
] as const;

type PageId = (typeof PAGES)[number]["id"];

const isPageId = (id: string | null): id is PageId =>
  PAGES.some((page) => page.id === id);

/** Edit each page's text, show or hide optional pages, home photos, About. */
const PageContentManagement = () => {
  const { toast } = useToast();
  const { pageData, loading, refreshPageData } = usePageDataFromDB();
  const [params, setParams] = useSearchParams();
  const [toggling, setToggling] = useState(false);

  // The open page is kept in the URL (?section=pages&page=about)
  const requested = params.get("page");
  const activeId: PageId = isPageId(requested) ? requested : "home";
  const page = PAGES.find((p) => p.id === activeId) ?? PAGES[0];
  const entry = pageData[page.id];
  const isHidden = (id: string) => pageData[id]?.isVisible === false;

  const openPage = (id: PageId) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("page", id);
        return next;
      },
      { replace: true }
    );

  const setVisible = async (visible: boolean) => {
    setToggling(true);
    try {
      await apiClient.updatePageContent(page.id, { isVisible: visible });
      await refreshPageData();
      toast({
        title: visible
          ? `${page.label} page is now on the website`
          : `${page.label} page is now hidden`,
      });
    } catch (error) {
      toast({
        title: "Couldn't change the page",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setToggling(false);
    }
  };

  return (
    <AdminPage
      title="Pages"
      description="The title and introduction of each page, and which optional pages are on the website."
      actions={
        <Button variant="outline" asChild>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            View website
          </a>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <nav aria-label="Pages" className="lg:sticky lg:top-10">
          <ul className="grid grid-cols-3 gap-1 rounded-xl border bg-white p-1.5 shadow-[0_1px_2px_hsl(var(--ink)/0.04)] lg:grid-cols-1">
            {PAGES.map(({ id, label, path }) => {
              const current = id === activeId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => openPage(id)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      current
                        ? "bg-accent font-medium text-ink"
                        : "text-stone hover:bg-accent/60 hover:text-ink"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{label}</span>
                      <span className="hidden truncate text-xs font-normal text-mist lg:block">
                        {path}
                      </span>
                    </span>
                    {isHidden(id) && (
                      <>
                        <EyeOff
                          className="size-3.5 shrink-0 text-mist"
                          aria-hidden="true"
                        />
                        <span className="sr-only">(hidden)</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {loading ? (
            <LoadingPanel label="Loading pages…" />
          ) : !entry ? (
            <EmptyState
              title="This page can't be edited yet"
              description="It has no saved settings in the database."
            />
          ) : (
            <>
              <Panel
                title={page.label}
                description={page.hint}
                actions={
                  !isHidden(page.id) && (
                    <IconLink
                      label="View page"
                      icon={ExternalLink}
                      href={page.path}
                    />
                  )
                }
              >
                {page.hideable && (
                  <div className="mb-6 flex items-start justify-between gap-4 rounded-lg bg-secondary px-4 py-3">
                    <div>
                      <Label htmlFor="page-visible">Shown on the website</Label>
                      <p className="mt-1 text-xs text-mist">
                        {isHidden(page.id)
                          ? "Hidden: it isn't in the menu, and its address leads to the home page."
                          : "In the menu and open to visitors."}
                      </p>
                    </div>
                    <Switch
                      id="page-visible"
                      checked={!isHidden(page.id)}
                      disabled={toggling}
                      onCheckedChange={setVisible}
                    />
                  </div>
                )}
                <PageTextForm
                  key={page.id}
                  pageId={page.id}
                  page={entry}
                  titleLabel={page.titleLabel}
                  descriptionLabel={page.descriptionLabel}
                  descriptionRows={
                    "descriptionRows" in page ? page.descriptionRows : 4
                  }
                />
              </Panel>

              {page.id === "contact" && (
                <p className="flex gap-2.5 rounded-xl border bg-white px-5 py-4 text-sm text-stone">
                  <Info
                    className="mt-0.5 size-4 shrink-0 text-mist"
                    aria-hidden="true"
                  />
                  <span>
                    Contact details and opening hours are edited in{" "}
                    <Link
                      to="/admin?section=contact"
                      className="font-medium text-ink underline underline-offset-4 hover:text-stone"
                    >
                      Contact &amp; hours
                    </Link>
                    .
                  </span>
                </p>
              )}

              {page.id === "home" && (
                <Panel
                  title="Photos"
                  description="The photos behind the title, shown one after the other every few seconds."
                >
                  <HeroImageUpload />
                </Panel>
              )}

              {page.id === "about" && <AboutBlocksEditor />}
            </>
          )}
        </div>
      </div>
    </AdminPage>
  );
};

export default PageContentManagement;
