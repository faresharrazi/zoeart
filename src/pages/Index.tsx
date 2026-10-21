import Hero from "@/components/Hero";
import { PageLayout } from "@/components/PageLayout";
import RecentExhibitions from "@/components/RecentExhibitions";
import { useSeo } from "@/hooks/useSeo";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

const Index = () => {
  const { homeSettings } = usePageDataFromDB();
  useSeo({ description: homeSettings?.description });

  return (
    <PageLayout>
      <Hero />
      <RecentExhibitions />
    </PageLayout>
  );
};

export default Index;
