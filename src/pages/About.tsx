import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useEffect } from "react";

const About = () => {
  const { pageData } = usePageDataFromDB();

  // Check if page is visible
  const isPageVisible = pageData.about?.isVisible;

  // If page is not visible, redirect to home
  useEffect(() => {
    if (pageData && isPageVisible === false) {
      window.location.href = "/";
    }
  }, [pageData, isPageVisible]);

  // Don't render anything if page is not visible
  if (pageData && isPageVisible === false) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto my-24">
            <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
              {pageData.about?.title || "About Us"}
            </h1>
            <div
              className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: (pageData.about?.description || "").replace(
                  /\n/g,
                  "<br>"
                ),
              }}
            />
          </div>
        </div>
      </section>

      <div className="bg-gallery-light-grey py-20">
        <div className="container mx-auto px-6">
          {/* Dynamic Content Blocks */}
          {(pageData.about?.content?.content?.blocks || []).map(
            (block) =>
              block.isVisible && (
                <section key={block.id} className="mb-16">
                  <Card className="shadow-elegant">
                    <CardContent className="p-12 text-center">
                      <h2 className="text-3xl  mb-6 text-foreground">
                        {block.title}
                      </h2>
                      <div
                        className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: block.content.replace(/\n/g, "<br>"),
                        }}
                      />
                    </CardContent>
                  </Card>
                </section>
              )
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
