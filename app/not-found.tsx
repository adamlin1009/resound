import EmptyState from "@/components/EmptyState";

export const dynamic = 'force-dynamic';

const NotFoundPage = () => {
  return (
    <EmptyState 
      title="404 - Not Found" 
      subtitle="Could not find the requested page." 
    />
  );
};

export default NotFoundPage; 