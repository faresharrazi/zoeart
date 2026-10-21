import {
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAboutBlocks } from "@/hooks/useAboutBlocks";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { renderRichText } from "@/lib/richText";
import { useSeo } from "@/hooks/useSeo";

// Admin text keeps its line breaks
const withLineBreaks = (text: string) =>
  renderRichText(text.replace(/\n/g, "<br>"));

const About = () => {
  const { pageData } = usePageDataFromDB();
  const { visibleBlocks, loading } = useAboutBlocks();
  useSeo({
    title: pageData.about?.title || "About",
    description: pageData.about?.description,
  });

  return (
    <RequireVisiblePage page="about">
      <PageLayout>
        <PageHeader
          title={pageData.about?.title || "About Us"}
          description={
            <div
              dangerouslySetInnerHTML={{
                __html: withLineBreaks(pageData.about?.description || ""),
              }}
            />
          }
        />

        <div className="bg-gallery-light-grey py-20">
          <div className="container mx-auto px-6">
            {loading ? (
              <LoadingState label="Loading…" />
            ) : (
              visibleBlocks.map((block) => (
                <section key={block.id} className="mb-16">
                  <Card className="shadow-elegant">
                    <CardContent className="p-12 text-center">
                      <h2 className="text-3xl font-semibold mb-4 text-foreground">
                        {block.title}
                      </h2>
                      <div
                        className="rich-text text-lg text-muted-foreground max-w-4xl mx-auto"
                        dangerouslySetInnerHTML={{
                          __html: withLineBreaks(block.content),
                        }}
                      />
                    </CardContent>
                  </Card>
                </section>
              ))
            )}
          </div>
        </div>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default About;
