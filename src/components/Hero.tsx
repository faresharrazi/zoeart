import { Link } from "react-router-dom";
import HeroImageSlider from "@/components/HeroImageSlider";
import { Container } from "@/components/PageLayout";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useHeroImages } from "@/hooks/useHeroImages";
import { formatDate } from "@/lib/dates";
import type { ExhibitionSummary } from "@/components/ExhibitionCard";

/**
 * Full-screen photo (the admin's hero images) with the gallery name and a
 * link to the next exhibition.
 */
const Hero = ({ next }: { next?: ExhibitionSummary }) => {
  const { homeSettings } = usePageDataFromDB();
  const { heroImages } = useHeroImages();
  const tagline = homeSettings?.description?.split("\n")[0];

  return (
    <section className="relative h-[92svh] min-h-[560px] max-h-[980px] overflow-hidden bg-ink text-white">
      {heroImages.length > 0 && (
        <HeroImageSlider
          images={heroImages.map((img) => img.cloudinary_url)}
          interval={5000}
        />
      )}
      {/* Keeps the menu and the title readable over any photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_22%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.72)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0">
        <Container className="pb-14 md:pb-16 flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-5xl">
            <h1 className="font-medium uppercase leading-none tracking-[0.03em] text-[clamp(2.25rem,5.2vw,5rem)]">
              {homeSettings?.title || "Aether Art Space"}
            </h1>
            {tagline && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
                {tagline}
              </p>
            )}
          </div>

          {next && (
            <Link
              to={`/exhibition/${next.slug}`}
              className="group flex max-w-[300px] flex-col gap-1.5 border-l border-white pl-5"
            >
              <span className="eyebrow text-white/80">
                {next.status === "current" ? "On view now" : "Next"}
                {next.start_date && next.status !== "current"
                  ? ` · ${formatDate(next.start_date)}`
                  : ""}
              </span>
              <span className="font-medium text-[28px] leading-tight group-hover:underline underline-offset-4 decoration-1">
                {next.title.trim()}
              </span>
              {next.location && (
                <span className="text-sm text-white/80">
                  {next.location.trim()}
                </span>
              )}
            </Link>
          )}
        </Container>
      </div>
    </section>
  );
};

export default Hero;
