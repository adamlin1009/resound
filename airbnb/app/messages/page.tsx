import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import MessagesClient from "./MessagesClient";

const MessagesPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your messages"
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <MessagesClient currentUser={currentUser} />
    </ClientOnly>
  );
};

export default MessagesPage;