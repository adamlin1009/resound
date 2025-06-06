import getCurrentUser from '@/app/actions/getCurrentUser';
import getReservationById from '@/app/actions/getReservationById';

import ClientOnly from '@/components/ClientOnly';
import EmptyState from '@/components/EmptyState';

import RentalManageClient from './RentalManageClient';

const RentalManagePage = async ({ params }: { params: Promise<{ reservationId: string }> }) => {
  const resolvedParams = await params;
  const reservation = await getReservationById(resolvedParams);
  const currentUser = await getCurrentUser();

  if (!reservation) {
    return (
      <ClientOnly>
        <EmptyState
          title="Reservation not found"
          subtitle="This reservation doesn't exist or you don't have permission to view it."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <RentalManageClient
        reservation={reservation}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default RentalManagePage;