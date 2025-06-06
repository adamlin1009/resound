import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservation from "@/app/actions/getReservations";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ListingClient from "@/components/ListingClient";
import prisma from "@/lib/prismadb";

interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: Promise<IParams> }) => {
  const { listingId } = await params;

  const listing = await getListingById({ listingId });
  const reservations = await getReservation({ listingId });
  const currentUser = await getCurrentUser();

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  // Check if current user has a paid reservation for this listing
  let hasPaidReservation = false;
  if (currentUser && listingId) {
    const userReservation = await prisma.reservation.findFirst({
      where: {
        listingId: listingId,
        userId: currentUser.id,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    });
    
    if (userReservation) {
      // Check if there's a successful payment for this reservation
      const payment = await prisma.payment.findFirst({
        where: {
          userId: currentUser.id,
          listingId: listingId,
          status: 'SUCCEEDED',
          startDate: userReservation.startDate,
          endDate: userReservation.endDate
        }
      });
      hasPaidReservation = !!payment;
    }
  }

  return (
    <ClientOnly>
      <ListingClient
        listing={listing}
        currentUser={currentUser}
        reservations={reservations}
        hasPaidReservation={hasPaidReservation}
      />
    </ClientOnly>
  );
};

export default ListingPage;
