import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";
import getOwnerReservations from "../actions/getOwnerReservations";
import InstrumentsClient from "./InstrumentsClient";

type Props = {};

export const dynamic = 'force-dynamic';

const InstrumentsPage = async (props: Props) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Unauthorized" subtitle="Please login" />
      </ClientOnly>
    );
  }

  const listings = await getListings({ userId: currentUser.id });
  const { reservations: ownerReservations, pendingSetups } = await getOwnerReservations();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No instruments found"
          subtitle="Looks like you haven't listed any instruments yet"
        />
      </ClientOnly>
    );
  }
  return (
    <ClientOnly>
      <InstrumentsClient 
        listings={listings} 
        currentUser={currentUser}
        pendingSetups={pendingSetups}
        ownerReservations={ownerReservations}
      />
    </ClientOnly>
  );
};

export default InstrumentsPage;
