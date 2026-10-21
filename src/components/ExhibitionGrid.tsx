import ExhibitionCard, {
  type ExhibitionSummary,
} from "@/components/ExhibitionCard";

/** A titled grid of exhibition cards; renders nothing when empty. */
const ExhibitionGrid = ({
  title,
  exhibitions,
  centered = false,
}: {
  title: string;
  exhibitions: ExhibitionSummary[];
  centered?: boolean;
}) => {
  if (exhibitions.length === 0) return null;
  return (
    <section>
      <h2
        className={
          centered
            ? "text-4xl md:text-5xl font-bold text-theme-text-primary mb-12 text-center"
            : "text-3xl mb-8 text-theme-text-primary"
        }
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exhibitions.map((exhibition) => (
          <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
        ))}
      </div>
    </section>
  );
};

export default ExhibitionGrid;
