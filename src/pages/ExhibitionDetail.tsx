import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image as ImageIcon,
  MapPin,
  UserCheck,
} from "lucide-react";
import ExhibitionGallery from "@/components/ExhibitionGallery";
import {
  LoadingState,
  NotFoundState,
  PageLayout,
} from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { useArticleByExhibition, type Article } from "@/hooks/useArticles";
import { apiClient } from "@/lib/apiClient";
import { formatDate } from "@/lib/dates";
import { STATUS_STYLES } from "@/lib/exhibitions";
import { fetchPriority, imageSrcSet, imageUrl } from "@/lib/images";
import { renderRichText } from "@/lib/richText";
import { SITE_NAME, useSeo } from "@/hooks/useSeo";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

// Social preview images: 1200x630, cropped to fill
const shareImage = (url: string | null | undefined) =>
  url ? imageUrl(url, { width: 1200, height: 630, crop: "fill" }) : null;

const BackButton = () => (
  <Button
    asChild
    variant="secondary"
    size="sm"
    className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
  >
    <Link to="/exhibitions">
      <ArrowLeft
        className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2"
        aria-hidden="true"
      />
      <span className="hidden sm:inline">Back to Exhibitions</span>
      <span className="sm:hidden">Back</span>
    </Link>
  </Button>
);

/** The poster over a blurred copy of itself. */
const Poster = ({ image, title }: { image: string | null; title: string }) => (
  <section
    className={`relative w-full overflow-hidden flex items-center justify-center ${
      image
        ? "min-h-[60vh] md:min-h-[70vh] bg-gray-100"
        : "h-[40vh] bg-gradient-to-br from-gray-900 via-black to-gray-800"
    }`}
  >
    {image ? (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-110"
          style={{ backgroundImage: `url(${imageUrl(image, { width: 400 })})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <div className="relative z-10 p-4 flex items-center justify-center">
          <img
            src={imageUrl(image, { width: 1400 })}
            srcSet={imageSrcSet(image, [600, 900, 1400])}
            sizes="(min-width: 1024px) 700px, (min-width: 768px) 600px, 100vw"
            alt={`${title} exhibition poster`}
            {...fetchPriority("high")}
            className="w-auto max-w-full md:max-w-[600px] lg:max-w-[700px] max-h-[50vh] md:max-h-[60vh] object-contain drop-shadow-2xl"
          />
        </div>
      </>
    ) : (
      <div className="text-center">
        <ImageIcon
          className="w-16 h-16 text-white/50 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-white/70 text-lg">No featured image</p>
      </div>
    )}
    <div className="absolute top-2 left-2 md:top-6 md:left-6 z-20">
      <BackButton />
    </div>
  </section>
);

const Fact = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) => (
  <Card className="p-6">
    <CardContent className="text-center p-0">
      <Icon className="w-8 h-8 text-gray-600 mx-auto mb-3" aria-hidden="true" />
      <h2 className="text-gray-600 text-sm font-medium mb-2">{label}</h2>
      {children}
    </CardContent>
  </Card>
);

const ArticleSection = ({ article }: { article: Article }) => (
  <article className="mb-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100">
    <header className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>
      {article.author && (
        <p className="text-gray-600 text-sm">By {article.author}</p>
      )}
    </header>

    {article.featured_image && (
      <img
        src={imageUrl(article.featured_image, { width: 1200 })}
        alt=""
        loading="lazy"
        className="w-full h-auto rounded-lg shadow-md mb-6"
      />
    )}

    <div
      className="rich-text text-lg"
      dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
    />

    {article.media_files && article.media_files.length > 0 && (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Additional Media
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {article.media_files.map((mediaUrl, index) => (
            <div
              key={mediaUrl + index}
              className="rounded-lg overflow-hidden shadow-md"
            >
              {/\.(mp4|webm|ogg)$/i.test(mediaUrl) ? (
                <video src={mediaUrl} controls className="w-full h-auto">
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={imageUrl(mediaUrl, { width: 800 })}
                  alt={`${article.title}, media ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </article>
);

const ExhibitionDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: exhibition, loading } = useApi(
    () => apiClient.getExhibition(slug),
    [slug]
  );
  const { article } = useArticleByExhibition(exhibition?.id);
  const { contactInfo } = usePageDataFromDB();
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
      location: {
        "@type": "Place",
        name: exhibition.location || SITE_NAME,
        address: contactInfo?.address || exhibition.location || undefined,
      },
      organizer: {
        "@type": "Organization",
        name: SITE_NAME,
        url: window.location.origin,
      },
      performer: exhibition.artists?.map((artist: { name: string }) => ({
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
          title="Exhibition Not Found"
          message="The exhibition you're looking for doesn't exist or has been removed."
          backTo="/exhibitions"
          backLabel="Back to Exhibitions"
        />
      </PageLayout>
    );
  }

  const status = STATUS_STYLES[exhibition.status] || STATUS_STYLES.past;
  const artists: {
    id: number;
    name: string;
    slug: string;
    profile_image: string | null;
  }[] = exhibition.artists || [];

  return (
    <PageLayout>
      <Poster image={exhibition.featured_image} title={exhibition.title} />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Badge
              variant="outline"
              className={`mb-6 px-4 py-2 text-base font-semibold ${status.className}`}
            >
              {status.label}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {exhibition.title}
            </h1>

            {exhibition.description && (
              <p className="text-gray-700 leading-relaxed text-lg mb-8 whitespace-pre-line">
                {exhibition.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {exhibition.start_date && (
                <Fact icon={Calendar} label="Start Date">
                  <p className="text-gray-900 font-semibold text-lg">
                    {formatDate(exhibition.start_date)}
                  </p>
                  {exhibition.end_date && (
                    <p className="text-gray-500 text-sm mt-1">
                      to {formatDate(exhibition.end_date)}
                    </p>
                  )}
                </Fact>
              )}
              {exhibition.location && (
                <Fact icon={MapPin} label="Location">
                  <p className="text-gray-900 font-semibold text-lg">
                    {exhibition.location}
                  </p>
                </Fact>
              )}
              {exhibition.curator && (
                <Fact icon={UserCheck} label="Curator">
                  <p className="text-gray-900 font-semibold text-lg">
                    {exhibition.curator}
                  </p>
                </Fact>
              )}
              {exhibition.press_media_name && (
                <Fact icon={FileText} label="Press Media">
                  <p className="text-gray-900 font-semibold text-lg mb-4">
                    {exhibition.press_media_name}
                  </p>
                  {exhibition.press_media_link && (
                    <Button
                      asChild
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <a
                        href={exhibition.press_media_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    </Button>
                  )}
                </Fact>
              )}
            </div>

            {exhibition.call_for_artists && exhibition.cta_link && (
              <div className="text-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold"
                >
                  <a
                    href={exhibition.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join as Artist
                  </a>
                </Button>
              </div>
            )}

            {artists.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Featured Artists
                </h2>
                <ul className="flex flex-wrap justify-center gap-6">
                  {artists.map((artist) => (
                    <li key={artist.id} className="w-32">
                      <Link
                        to={`/artist/${artist.slug}`}
                        className="block text-center hover:scale-105 transition-all duration-300"
                      >
                        {artist.profile_image ? (
                          <img
                            src={imageUrl(artist.profile_image, {
                              width: 160,
                              height: 160,
                              crop: "fill",
                            })}
                            alt=""
                            loading="lazy"
                            className="w-20 h-20 mx-auto mb-3 rounded-full object-cover"
                          />
                        ) : (
                          <span className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCheck
                              className="w-8 h-8 text-gray-600"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                        <span className="block text-gray-900 font-semibold text-lg">
                          {artist.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {exhibition.gallery_images.length > 0 && (
              <div className="mb-12">
                <ExhibitionGallery
                  images={exhibition.gallery_images}
                  title={exhibition.title}
                />
              </div>
            )}

            {article && <ArticleSection article={article} />}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ExhibitionDetail;
