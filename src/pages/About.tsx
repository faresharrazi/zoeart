import {
  Container,
  LoadingState,
  PageHeader,
  PageLayout,
  RequireVisiblePage,
} from "@/components/PageLayout";
import { useAboutBlocks } from "@/hooks/useAboutBlocks";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { renderRichText } from "@/lib/richText";

// Admin text keeps its line breaks
const withLineBreaks = (text: string) =>
  renderRichText(text.replace(/\n/g, "<br>"));

const About = () => {
  const { pageData } = usePageDataFromDB();
  const { visibleBlocks, loading } = useAboutBlocks();
  const title = pageData.about?.title?.trim() || "About";
  useSeo({ title, description: pageData.about?.description });

  return (
    <RequireVisiblePage page="about">
      <PageLayout>
        <PageHeader
          title={title}
          description={
            pageData.about?.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: withLineBreaks(pageData.about.description),
                }}
              />
            )
          }
        />

        <Container>
          {loading ? (
            <LoadingState label="Loading…" />
          ) : (
            visibleBlocks.map((block) => (
              <section
                key={block.id}
                className="grid gap-8 border-t border-line py-14 md:grid-cols-12 md:gap-16 md:py-20"
              >
                <h2 className="font-medium text-3xl md:text-4xl leading-tight md:col-span-4">
                  {block.title}
                </h2>
                <div
                  className="rich-text text-lg md:col-span-8 max-w-3xl"
                  dangerouslySetInnerHTML={{
                    __html: withLineBreaks(block.content),
                  }}
                />
              </section>
            ))
          )}
        </Container>
      </PageLayout>
    </RequireVisiblePage>
  );
};

export default About;
