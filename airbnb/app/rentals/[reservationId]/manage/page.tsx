import getCurrentUser from '@/app/actions/getCurrentUser';
import getReservationById from '@/app/actions/getReservationById';

import ClientOnly from '@/components/ClientOnly';
import EmptyState from '@/components/EmptyState';

import RentalManageClient from './RentalManageClient';

interface IParams {
  reservationId?: string;
}

const RentalManagePage = async ({ params }: { params: IParams }) => {
  const reservation = await getReservationById(params);
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