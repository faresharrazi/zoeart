import { Link } from "react-router-dom";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDateRange } from "@/lib/dates";
import { imageSrcSet, imageUrl } from "@/lib/images";
import type { Exhibition } from "@/types/api";

export type ExhibitionSummary = Pick<
  Exhibition,
  | "id"
  | "slug"
  | "title"
  | "status"
  | "start_date"
  | "end_date"
  | "location"
  | "featured_image"
  | "description"
  | "curator"
>;

/** Poster, title, dates and place; the whole card links to the exhibition. */
const ExhibitionCard = ({
  exhibition,
  headingLevel: Heading = "h3",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw",
}: {
  exhibition: ExhibitionSummary;
  headingLevel?: "h2" | "h3";
  sizes?: string;
}) => {
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date);
  const meta = [dates, exhibition.location?.trim()].filter(Boolean).join(" · ");

  return (
    <article className="group relative flex flex-col gap-4">
      <div className="aspect-[3/4] overflow-hidden bg-sand">
        <ImageWithFallback
          src={imageUrl(exhibition.featured_image, {
            width: 680,
            height: 906,
            crop: "fill",
          })}
          srcSet={imageSrcSet(
            exhibition.featured_image,
            [340, 520, 680, 1020],
            {
              width: 680,
              height: 906,
              crop: "fill",
            }
          )}
          sizes={sizes}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-6xl text-mist" aria-hidden="true">
                {exhibition.title.trim().charAt(0)}
              </span>
            </div>
          }
        />
      </div>
      <div className="space-y-1.5">
        {exhibition.status === "current" && (
          <p className="eyebrow text-ink">On view now</p>
        )}
        <Heading className="font-medium text-[22px] leading-snug">
          {/* The link covers the whole card */}
          <Link
            to={`/exhibition/${exhibition.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"
          >
            {exhibition.title.trim()}
          </Link>
        </Heading>
        {meta && <p className="text-sm text-mist">{meta}</p>}
      </div>
    </article>
  );
};

export default ExhibitionCard;
