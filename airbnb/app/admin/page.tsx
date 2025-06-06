import checkAdminUser from "@/app/actions/checkAdminUser";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import AdminClient from "./AdminClient";

const AdminPage = async () => {
  const currentUser = await checkAdminUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Access Denied"
          subtitle="You don't have permission to access this page"
          showReset={false}
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <AdminClient currentUser={currentUser} />
    </ClientOnly>
  );
};

export default AdminPage;