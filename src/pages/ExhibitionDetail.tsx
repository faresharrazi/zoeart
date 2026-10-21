import { Link, useParams } from "react-router-dom";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  BackLink,
  Container,
  LoadingState,
  NotFoundState,
  PageLayout,
} from "@/components/PageLayout";
import { useApi } from "@/hooks/useApi";
import { useArticleByExhibition, type Article } from "@/hooks/useArticles";
import { SITE_NAME, useSeo } from "@/hooks/useSeo";
import { apiClient } from "@/lib/apiClient";
import { formatDateRange } from "@/lib/dates";
import { STATUS_LABELS } from "@/lib/exhibitions";
import { fetchPriority, imageSrcSet, imageUrl } from "@/lib/images";
import { renderRichText } from "@/lib/richText";

// Social preview images: 1200x630, cropped to fill
const shareImage = (url: string | null | undefined) =>
  url ? imageUrl(url, { width: 1200, height: 630, crop: "fill" }) : null;

const buttonClass =
  "inline-flex h-12 items-center px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-3xl md:text-4xl mb-10">{children}</h2>
);

const ArticleSection = ({ article }: { article: Article }) => (
  <section className="border-t border-line py-16 md:py-24">
    <div className="mx-auto max-w-[720px]">
      {article.author && (
        <p className="eyebrow text-mist mb-5">By {article.author}</p>
      )}
      <h2 className="font-display text-4xl md:text-5xl leading-[1.1] mb-10">
        {article.title}
      </h2>
      {article.featured_image && (
        <img
          src={imageUrl(article.featured_image, { width: 1440 })}
          alt=""
          loading="lazy"
          className="w-full h-auto mb-10"
        />
      )}
      <div
        className="rich-text text-lg"
        dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
      />

      {article.media_files && article.media_files.length > 0 && (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {article.media_files.map((mediaUrl, index) =>
            /\.(mp4|webm|ogg)$/i.test(mediaUrl) ? (
              <video
                key={mediaUrl + index}
                src={mediaUrl}
                controls
                className="w-full h-auto"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                key={mediaUrl + index}
                src={imageUrl(mediaUrl, { width: 900 })}
                alt={`${article.title}, image ${index + 1}`}
                loading="lazy"
                className="w-full h-auto"
              />
            )
          )}
        </div>
      )}
    </div>
  </section>
);

const ExhibitionDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: exhibition, loading } = useApi(
    () => apiClient.getExhibition(slug),
    [slug]
  );
  const { article } = useArticleByExhibition(exhibition?.id);
  useSeo({
    title: exhibition?.title || (loading ? undefined : "Exhibition Not Found"),
    description: exhibition?.description,
    image: shareImage(exhibition?.featured_image),
    type: "article",
    noIndex: !loading && !exhibition,
    jsonLd: exhibition && {
      "@context": "https://schema.org",
      "@type": "ExhibitionEvent",
      name: exhibition.title,
      description: exhibition.description || undefined,
      startDate: exhibition.start_date || undefined,
      endDate: exhibition.end_date || undefined,
      image: exhibition.featured_image || undefined,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: exhibition.location || SITE_NAME },
      organizer: {
        "@type": "Organization",
        name: SITE_NAME,
        url: window.location.origin,
      },
      performer: exhibition.artists?.map((artist) => ({
        "@type": "Person",
        name: artist.name,
      })),
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <LoadingState label="Loading exhibition…" />
      </PageLayout>
    );
  }

  if (!exhibition) {
    return (
      <PageLayout>
        <NotFoundState
          title="Exhibition not found"
          message="The exhibition you're looking for doesn't exist or has been removed."
          backTo="/exhibitions"
          backLabel="All exhibitions"
        />
      </PageLayout>
    );
  }

  const title = exhibition.title.trim();
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date);
  const facts = [
    { label: "Dates", value: dates },
    { label: "Location", value: exhibition.location?.trim() },
    { label: "Curated by", value: exhibition.curator?.trim() },
  ].filter((fact) => fact.value);
  const artists = exhibition.artists ?? [];

  return (
    <PageLayout>
      <Container className="grid gap-12 py-12 md:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ImageWithFallback
            src={imageUrl(exhibition.featured_image, { width: 1400 })}
            srcSet={imageSrcSet(
              exhibition.featured_image,
              [700, 1000, 1400, 1800]
            )}
            sizes="(min-width: 1024px) 55vw, 100vw"
            alt={`${title}, exhibition poster`}
            {...fetchPriority("high")}
            className="w-full max-h-[88vh] object-contain object-left-top"
            fallback={<div className="aspect-[3/4] w-full bg-sand" />}
          />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-8">
          <BackLink to="/exhibitions">All exhibitions</BackLink>
          <div className="space-y-5">
            <p className="eyebrow text-mist">
              {STATUS_LABELS[exhibition.status]}
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.02]">
              {title}
            </h1>
          </div>
          {exhibition.description && (
            <p className="text-lg leading-relaxed text-stone whitespace-pre-line">
              {exhibition.description.trim()}
            </p>
          )}
          {facts.length > 0 && (
            <dl className="border-t border-line">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[120px_1fr] gap-4 border-b border-line py-4 text-sm"
                >
                  <dt className="text-mist">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {((exhibition.call_for_artists && exhibition.cta_link) ||
            exhibition.press_media_link) && (
            <div className="flex flex-wrap gap-3">
              {exhibition.call_for_artists && exhibition.cta_link && (
                <a
                  href={exhibition.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass} bg-ink text-paper hover:bg-ink/85`}
                >
                  Apply as an artist
                </a>
              )}
              {exhibition.press_media_link && (
                <a
                  href={exhibition.press_media_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass} border border-ink hover:bg-ink hover:text-paper`}
                >
                  {exhibition.press_media_name?.trim() || "Press release"} (PDF)
                </a>
              )}
            </div>
          )}
        </div>
      </Container>

      <Container>
        {artists.length > 0 && (
          <section className="border-t border-line py-16 md:py-20">
            <SectionTitle>Artists</SectionTitle>
            <ul className="flex flex-wrap gap-x-10 gap-y-8">
              {artists.map((artist) => (
                <li key={artist.id}>
                  <Link
                    to={`/artist/${artist.slug}`}
                    className="group flex items-center gap-4"
                  >
                    <ImageWithFallback
                      src={imageUrl(artist.profile_image, {
                        width: 160,
                        height: 160,
                        crop: "fill",
                      })}
                      alt=""
                      loading="lazy"
                      className="h-16 w-16 rounded-full object-cover bg-sand"
                      fallback={
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand font-display text-2xl text-mist">
                          {artist.name.trim().charAt(0)}
                        </span>
                      }
                    />
                    <span className="font-display text-2xl group-hover:underline underline-offset-4 decoration-1">
                      {artist.name.trim()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {exhibition.gallery_images.length > 0 && (
          <section className="border-t border-line py-16 md:py-20">
            <SectionTitle>Gallery</SectionTitle>
            <ExhibitionGallery
              images={exhibition.gallery_images}
              title={title}
            />
          </section>
        )}

        {article && <ArticleSection article={article} />}
      </Container>
    </PageLayout>
  );
};

export default ExhibitionDetail;
