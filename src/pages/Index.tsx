import { Link } from "react-router-dom";
import ExhibitionStrip from "@/components/ExhibitionStrip";
import Hero from "@/components/Hero";
import NewsletterForm from "@/components/NewsletterForm";
import { Container, PageLayout } from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";

// Soonest first; exhibitions on view now come before upcoming ones
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
  const upcoming = [
    ...exhibitions.filter((e) => e.status === "current").sort(byStartDate),
    ...exhibitions.filter((e) => e.status === "upcoming").sort(byStartDate),
  ];
  const about = pageData.about;

  return (
    <PageLayout overlayNav>
      <Hero next={upcoming[0]} />

      {upcoming.length > 0 && (
        <ExhibitionStrip title="Upcoming" exhibitions={upcoming} />
      )}

      {about?.isVisible !== false && about?.description && (
        <section className="bg-ink text-paper">
          <Container className="py-24 md:py-32 flex flex-col items-center gap-10 text-center">
            <p className="font-display text-3xl md:text-[3.25rem] leading-[1.15] max-w-4xl">
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
            className="font-display text-4xl md:text-5xl leading-[1.1] max-w-lg"
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
