import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroImageSlider from "@/components/HeroImageSlider";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useHeroImages } from "@/hooks/useHeroImages";

const Hero = () => {
  const { homeSettings } = usePageDataFromDB();
  const { heroImages } = useHeroImages();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {heroImages.length > 0 && (
        <HeroImageSlider
          images={heroImages.map((img) => img.cloudinary_url)}
          interval={2000}
        />
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl md:text-6xl mb-6 text-white drop-shadow-lg min-h-[1.2em]">
            {homeSettings?.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md min-h-[1.5em]">
            {homeSettings?.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="default"
              className="px-8 py-3 text-lg shadow-lg"
            >
              <Link to="/exhibitions">Exhibitions</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-theme-primary backdrop-blur-sm px-8 py-3 text-lg shadow-lg"
            >
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
