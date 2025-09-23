import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

interface ExhibitionCardProps {
  exhibition: {
    id: number;
    slug: string;
    title: string;
    curator: string;
    dates: string;
    location: string;
    description: string;
    status: string;
    call_for_artists?: boolean;
    cta_link?: string;
    featuredImage?: string;
  };
  onExhibitionClick: (slug: string) => void;
}

const ExhibitionCard = ({
  exhibition,
  onExhibitionClick,
}: ExhibitionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "!bg-theme-primary !text-white";
      case "past":
        return "!bg-theme-text-muted !text-white";
      default:
        return "!bg-theme-primary !text-white";
    }
  };

  return (
    <Card
      className="border-2 border-transparent overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => onExhibitionClick(exhibition.slug)}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-theme-primary/20 to-theme-primary/5 relative overflow-hidden flex-shrink-0">
        {/* Featured Image Background */}
        {exhibition.featuredImage ? (
          <img
            src={exhibition.featuredImage}
            alt={exhibition.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center">
                            <div class="text-center text-theme-text-muted">
                              <div class="w-16 h-16 mx-auto mb-4 bg-theme-primary/20 rounded-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                              <p class="text-sm">Exhibition Image</p>
                            </div>
                          </div>
                        `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-theme-text-muted">
              <div className="w-16 h-16 mx-auto mb-4 bg-theme-primary/20 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-theme-primary" />
              </div>
              <p className="text-sm">Exhibition Image</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge
            className={`${getStatusColor(exhibition.status)} font-semibold`}
          >
            {exhibition.status}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="space-y-4 flex-grow">
          <div>
            <h3 className="text-xl font-bold text-theme-text-primary mb-2">
              {exhibition.title}
            </h3>
            <p className="text-sm text-theme-text-muted font-medium">
              Curated by {exhibition.curator}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-theme-text-muted">
              <Calendar className="w-4 h-4 mr-2" />
              {exhibition.dates}
            </div>
            <div className="flex items-center text-sm text-theme-text-muted">
              <MapPin className="w-4 h-4 mr-2" />
              {exhibition.location}
            </div>
          </div>

          <p className="text-theme-text-muted text-sm line-clamp-3 flex-grow">
            {exhibition.description}
          </p>

          {exhibition.call_for_artists && (
            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (exhibition.cta_link) {
                    window.open(exhibition.cta_link, "_blank");
                  }
                }}
              >
                Join as an Artist
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExhibitionCard;
