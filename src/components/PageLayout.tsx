import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

/** Navigation, main content and footer, with a skip link for keyboard users. */
export const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
    >
      Skip to content
    </a>
    <Navigation />
    <main id="main" tabIndex={-1} className="outline-none">
      {children}
    </main>
    <Footer />
  </div>
);

/** The dark title band at the top of each page. */
export const PageHeader = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <section className="bg-[#0f0f0f] relative">
    <div className="container mx-auto px-6 text-center relative z-10">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
          {title}
        </h1>
        {description && (
          <div className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  </section>
);

export const LoadingState = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center py-24" role="status">
    <Loader2
      className="w-8 h-8 animate-spin text-theme-text-muted"
      aria-hidden="true"
    />
    <span className="ml-2 text-theme-text-muted">{label}</span>
  </div>
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
    <Button asChild variant="secondary" className="mt-6">
      <Link to={backTo}>
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        {backLabel}
      </Link>
    </Button>
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
