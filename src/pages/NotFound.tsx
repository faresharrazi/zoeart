import { NotFoundState, PageLayout } from "@/components/PageLayout";
import { useSeo } from "@/hooks/useSeo";

const NotFound = () => {
  useSeo({ title: "Page Not Found", noIndex: true });

  return (
    <PageLayout>
      <NotFoundState
        title="Page not found"
        message="The page you're looking for doesn't exist or has moved."
        backTo="/"
        backLabel="Return to Home"
      />
    </PageLayout>
  );
};

export default NotFound;
