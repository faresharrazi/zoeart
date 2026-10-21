import { Link } from "react-router-dom";
import { Calendar, Image, MapPin } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateRange } from "@/lib/dates";
import { STATUS_STYLES } from "@/lib/exhibitions";
import { imageSrcSet, imageUrl } from "@/lib/images";

export interface ExhibitionSummary {
  id: number;
  slug: string;
  title: string;
  curator?: string;
  start_date?: string | null;
  end_date?: string | null;
  location?: string;
  description?: string;
  status: string;
  call_for_artists?: boolean;
  cta_link?: string;
  featured_image?: string | null;
  gallery_images?: string[];
}

const ExhibitionCard = ({ exhibition }: { exhibition: ExhibitionSummary }) => {
  const status = STATUS_STYLES[exhibition.status] || STATUS_STYLES.past;
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date);
  const galleryCount = exhibition.gallery_images?.length ?? 0;

  return (
    <Card className="group relative border-2 border-transparent overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-br from-theme-primary/20 to-theme-primary/5 relative overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={imageUrl(exhibition.featured_image, { width: 800 })}
          srcSet={imageSrcSet(exhibition.featured_image, [400, 600, 800, 1200])}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain"
          fallback={
            <div className="w-full h-64 flex items-center justify-center">
              <div className="text-center text-theme-text-muted">
                <div className="w-16 h-16 mx-auto mb-4 bg-theme-primary/20 rounded-full flex items-center justify-center">
                  <Calendar
                    className="w-8 h-8 text-theme-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm">Exhibition Image</p>
              </div>
            </div>
          }
        />

        {galleryCount > 1 && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/70 text-white hover:bg-black/80">
              <Image className="w-3 h-3 mr-1" aria-hidden="true" />
              {galleryCount}
              <span className="sr-only"> images</span>
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="space-y-4 flex-grow flex flex-col">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-xl text-theme-text-primary">
                {/* The link covers the whole card */}
                <Link
                  to={`/exhibition/${exhibition.slug}`}
                  className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-theme-primary"
                >
                  {exhibition.title}
                </Link>
              </h3>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </Badge>
            </div>
            {exhibition.curator && (
              <p className="text-sm text-theme-text-muted">
                Curated by {exhibition.curator}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {dates && (
              <p className="flex items-center text-sm text-theme-text-muted">
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                {dates}
              </p>
            )}
            {exhibition.location && (
              <p className="flex items-center text-sm text-theme-text-muted">
                <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                {exhibition.location}
              </p>
            )}
          </div>

          {exhibition.description && (
            <p className="text-theme-text-muted text-sm line-clamp-3 flex-grow">
              {exhibition.description}
            </p>
          )}

          {exhibition.call_for_artists && exhibition.cta_link && (
            <Button
              asChild
              variant="outline"
              className="w-full mt-auto relative z-10"
            >
              <a
                href={exhibition.cta_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join as an Artist
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExhibitionCard;
