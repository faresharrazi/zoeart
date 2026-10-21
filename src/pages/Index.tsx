import { Link } from "react-router-dom";
import ExhibitionStrip from "@/components/ExhibitionStrip";
import Hero from "@/components/Hero";
import NewsletterForm from "@/components/NewsletterForm";
import { Container, PageLayout } from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";

// Soonest first
const byStartDate = (
  a: { start_date: string | null },
  b: { start_date: string | null }
) => (a.start_date || "9999").localeCompare(b.start_date || "9999");

const Index = () => {
  const { homeSettings, pageData } = usePageDataFromDB();
  useSeo({ description: homeSettings?.description });

  const { data: exhibitions = [] } = useApi(
    () => apiClient.getExhibitions(),
    []
  );
  const onView = exhibitions
    .filter((e) => e.status === "current")
    .sort(byStartDate);
  const upcoming = exhibitions
    .filter((e) => e.status === "upcoming")
    .sort(byStartDate);
  const about = pageData.about;

  return (
    <PageLayout overlayNav>
      <Hero next={onView[0] ?? upcoming[0]} />

      {/* Each section only appears when it has exhibitions */}
      {onView.length > 0 && (
        <ExhibitionStrip
          title="On view now"
          exhibitions={onView}
          showStatus={false}
        />
      )}
      {upcoming.length > 0 && (
        <ExhibitionStrip
          title="Upcoming"
          exhibitions={upcoming}
          // Closer to "On view now" when both are shown
          className={onView.length > 0 ? "pt-0 md:pt-0" : undefined}
        />
      )}

      {about?.isVisible !== false && about?.description && (
        <section className="bg-ink text-paper">
          <Container className="py-24 md:py-32 flex flex-col items-center gap-10 text-center">
            <p className="font-medium text-3xl md:text-[3.25rem] leading-[1.15] max-w-4xl">
              {about.description}
            </p>
            <Link
              to="/about"
              className="text-sm font-medium border-b border-paper pb-1 hover:text-paper/75 hover:border-paper/75"
            >
              About the gallery
            </Link>
          </Container>
        </section>
      )}

      <section aria-labelledby="newsletter-title">
        <Container className="py-24 md:py-28 grid gap-10 md:grid-cols-2 md:items-end">
          <h2
            id="newsletter-title"
            className="font-medium text-4xl md:text-5xl leading-[1.1] max-w-lg"
          >
            Be the first to know about new exhibitions.
          </h2>
          <NewsletterForm />
        </Container>
      </section>
    </PageLayout>
  );
};

export default Index;
