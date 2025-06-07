import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import React from "react";
import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservations";
import RentalsClient from "./RentalsClient";

export const dynamic = 'force-dynamic';

type Props = {};

const RentalsPage = async (props: Props) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Unauthorized" subtitle="Please login" />
      </ClientOnly>
    );
  }

  const reservationsResponse = await getReservations({
    userId: currentUser.id,
  });

  if (reservationsResponse.reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No rentals found"
          subtitle="Looks like you haven't rented any instruments yet."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <RentalsClient reservations={reservationsResponse.reservations} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default RentalsPage;
