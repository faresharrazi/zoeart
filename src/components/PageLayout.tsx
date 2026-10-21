import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { cn } from "@/lib/utils";

/** Page-width content column used by every section of the site. */
export const Container = ({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "header";
}) => (
  <Tag className={cn("mx-auto w-full max-w-[1360px] px-6 md:px-10", className)}>
    {children}
  </Tag>
);

/**
 * Navigation, main content and footer, with a skip link for keyboard users.
 * `overlayNav` lays the menu over a full-screen image (home page).
 */
export const PageLayout = ({
  children,
  overlayNav = false,
}: {
  children: React.ReactNode;
  overlayNav?: boolean;
}) => (
  <div className="min-h-screen bg-paper text-ink">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-paper focus:text-ink focus:px-4 focus:py-2"
    >
      Skip to content
    </a>
    <Navigation overlay={overlayNav} />
    <main id="main" tabIndex={-1} className="outline-none">
      {children}
    </main>
    <Footer />
  </div>
);

/** Title block at the top of a page. */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <Container as="header" className="pt-14 pb-12 md:pt-24 md:pb-16">
    {eyebrow && <p className="eyebrow text-mist mb-5">{eyebrow}</p>}
    <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-[-0.01em] max-w-5xl">
      {title}
    </h1>
    {description && (
      <div className="mt-6 max-w-2xl text-lg leading-relaxed text-stone">
        {description}
      </div>
    )}
    {children}
  </Container>
);

export const LoadingState = ({ label }: { label: string }) => (
  <div
    className="flex items-center justify-center py-32 text-mist"
    role="status"
  >
    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
    <span className="ml-3 text-sm">{label}</span>
  </div>
);

/** Small "← Back to …" link above a title. */
export const BackLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className="eyebrow inline-flex items-center gap-2 text-mist hover:text-ink transition-colors"
  >
    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
    {children}
  </Link>
);

export const NotFoundState = ({
  title,
  message,
  backTo,
  backLabel,
}: {
  title: string;
  message: string;
  backTo: string;
  backLabel: string;
}) => (
  <PageHeader title={title} description={<p>{message}</p>}>
    <div className="mt-10">
      <BackLink to={backTo}>{backLabel}</BackLink>
    </div>
  </PageHeader>
);

/**
 * Redirects to the home page when the admin has switched this page off.
 * `page` is the page_content name ("artists", "gallery", "about"...).
 */
export const RequireVisiblePage = ({
  page,
  children,
}: {
  page: string;
  children: React.ReactNode;
}) => {
  const { pageData } = usePageDataFromDB();
  if (pageData[page]?.isVisible === false) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
