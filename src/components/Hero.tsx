import { Button } from "@/components/ui/button";
import HeroImageSlider from "@/components/HeroImageSlider";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useHeroImagesNew } from "@/hooks/useHeroImagesNew";

const Hero = () => {
  const { homeSettings, loading: pageLoading } = usePageDataFromDB();
  const { heroImages, loading: imagesLoading } = useHeroImagesNew();

  // Show loading state while data is being fetched
  if (pageLoading || imagesLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  // Check if we have real images (not just placeholders)
  const hasRealImages =
    heroImages.length > 0 ||
    (homeSettings?.heroImages && homeSettings.heroImages.length > 0);

  // Use uploaded hero images, fallback to page settings, then placeholder
  const displayImages =
    heroImages.length > 0
      ? heroImages.map((img) => img.cloudinary_url)
      : homeSettings?.heroImages && homeSettings.heroImages.length > 0
      ? homeSettings.heroImages
      : [
          "https://via.placeholder.com/1920x1080/393E46/FFFFFF?text=Aether+Art+Space",
        ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {hasRealImages ? (
        <HeroImageSlider images={displayImages} interval={2000} />
      ) : (
        <div className="absolute inset-0 bg-black"></div>
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Consistent text overlay background for all cases */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl md:text-6xl mb-6 text-white drop-shadow-lg">
            {homeSettings.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {homeSettings.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              className="px-8 py-3 text-lg shadow-lg"
              onClick={() => (window.location.href = "/exhibitions")}
            >
              Exhibitions
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-theme-primary backdrop-blur-sm px-8 py-3 text-lg shadow-lg"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
