import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ExhibitionCard, {
  type ExhibitionSummary,
} from "@/components/ExhibitionCard";
import { Container } from "@/components/PageLayout";

const arrowClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 transition hover:border-ink disabled:opacity-30 disabled:hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

/** A titled row of exhibitions that scrolls sideways. */
const ExhibitionStrip = ({
  title,
  exhibitions,
}: {
  title: string;
  exhibitions: ExhibitionSummary[];
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState({ back: false, forward: false });

  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanScroll({
      back: list.scrollLeft > 4,
      forward: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    update();
    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      list.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, exhibitions.length]);

  const scroll = (direction: 1 | -1) =>
    listRef.current?.scrollBy({
      left: direction * listRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  return (
    <section className="py-20 md:py-28" aria-labelledby="strip-title">
      <Container className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h2 id="strip-title" className="font-medium text-4xl md:text-5xl">
          {title}
        </h2>
        <div className="flex items-center gap-6">
          <Link
            to="/exhibitions"
            className="text-sm font-medium border-b border-ink pb-1 hover:text-stone hover:border-stone"
          >
            All exhibitions
          </Link>
          {(canScroll.back || canScroll.forward) && (
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                className={arrowClass}
                onClick={() => scroll(-1)}
                disabled={!canScroll.back}
                aria-label="Scroll back"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={arrowClass}
                onClick={() => scroll(1)}
                disabled={!canScroll.forward}
                aria-label="Scroll forward"
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </Container>

      <Container>
        <ul
          ref={listRef}
          className="flex gap-7 overflow-x-auto snap-x snap-mandatory scrollbar-none"
        >
          {exhibitions.map((exhibition) => (
            <li
              key={exhibition.id}
              className="snap-start shrink-0 w-[78%] sm:w-[340px]"
            >
              <ExhibitionCard exhibition={exhibition} sizes="340px" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};

export default ExhibitionStrip;
