import { NotFoundState, PageLayout } from "@/components/PageLayout";

const NotFound = () => (
  <PageLayout>
    <NotFoundState
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has moved."
      backTo="/"
      backLabel="Return to Home"
    />
  </PageLayout>
);

export default NotFound;
