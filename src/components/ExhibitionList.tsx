import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ExhibitionCard, {
  type ExhibitionSummary,
} from "@/components/ExhibitionCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDateRange } from "@/lib/dates";
import { STATUS_LABELS, type ExhibitionView } from "@/lib/exhibitions";
import { imageUrl } from "@/lib/images";

const linkCover =
  "after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink";

const Poster = ({
  exhibition,
  width,
  className,
}: {
  exhibition: ExhibitionSummary;
  width: number;
  className: string;
}) => (
  <ImageWithFallback
    src={imageUrl(exhibition.featured_image, {
      width,
      height: Math.round((width * 4) / 3),
      crop: "fill",
    })}
    alt=""
    loading="lazy"
    decoding="async"
    className={`${className} object-cover bg-sand`}
    fallback={
      <div className={`${className} bg-sand flex items-center justify-center`}>
        <span className="font-display text-4xl text-mist" aria-hidden="true">
          {exhibition.title.trim().charAt(0)}
        </span>
      </div>
    }
  />
);

/** "Cards" view: poster beside the title, details and an excerpt. */
const WideCard = ({ exhibition }: { exhibition: ExhibitionSummary }) => {
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date);
  return (
    <article className="group relative grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 border-t border-line pt-6">
      <div className="overflow-hidden">
        <Poster
          exhibition={exhibition}
          width={420}
          className="aspect-[3/4] w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-mist">{STATUS_LABELS[exhibition.status]}</p>
        <h3 className="font-display text-2xl md:text-3xl leading-tight">
          <Link to={`/exhibition/${exhibition.slug}`} className={linkCover}>
            {exhibition.title.trim()}
          </Link>
        </h3>
        <p className="text-sm text-stone">
          {[dates, exhibition.location?.trim()].filter(Boolean).join(" · ")}
        </p>
        {exhibition.curator?.trim() && (
          <p className="text-sm text-mist">
            Curated by {exhibition.curator.trim()}
          </p>
        )}
        {exhibition.description && (
          <p className="text-sm leading-relaxed text-stone line-clamp-4">
            {exhibition.description.trim()}
          </p>
        )}
        <span
          className="mt-auto inline-flex items-center gap-2 text-sm font-medium"
          aria-hidden="true"
        >
          View exhibition
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
};

/** "List" view: one compact row per exhibition. */
const Row = ({ exhibition }: { exhibition: ExhibitionSummary }) => {
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date);
  return (
    <li className="group relative grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-5 gap-y-1 border-b border-line py-4 md:grid-cols-[64px_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
      <Poster
        exhibition={exhibition}
        width={128}
        className="row-span-2 md:row-span-1 aspect-[3/4] w-full"
      />
      <h3 className="font-display text-xl md:text-2xl leading-snug">
        <Link
          to={`/exhibition/${exhibition.slug}`}
          className={`${linkCover} group-hover:underline underline-offset-4 decoration-1`}
        >
          {exhibition.title.trim()}
        </Link>
      </h3>
      <p className="text-sm text-stone">{dates}</p>
      <p className="hidden md:block text-sm text-mist">
        {exhibition.location?.trim()}
      </p>
    </li>
  );
};

/** Exhibitions in the chosen layout. */
const ExhibitionList = ({
  exhibitions,
  view,
}: {
  exhibitions: ExhibitionSummary[];
  view: ExhibitionView;
}) => {
  if (view === "list") {
    return (
      <ul className="border-t border-line">
        {exhibitions.map((exhibition) => (
          <Row key={exhibition.id} exhibition={exhibition} />
        ))}
      </ul>
    );
  }
  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
        {exhibitions.map((exhibition) => (
          <WideCard key={exhibition.id} exhibition={exhibition} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {exhibitions.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
      ))}
    </div>
  );
};

export default ExhibitionList;
