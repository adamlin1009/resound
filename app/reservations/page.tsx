import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import React from "react";
import getCurrentUser from "../actions/getCurrentUser";
import getOwnerReservations from "../actions/getOwnerReservations";
import ReservationsClient from "./ReservationsClient";

type Props = {};

export const dynamic = 'force-dynamic';

const ReservationsPage = async (props: Props) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Unauthorized" subtitle="Please login" />
      </ClientOnly>
    );
  }

  const { reservations, pendingSetups } = await getOwnerReservations();

  // Filter out canceled reservations
  const activeReservations = reservations.filter(r => r.status !== "CANCELED");

  if (activeReservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No incoming rentals"
          subtitle="No musicians have rented your instruments yet."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ReservationsClient
        reservations={reservations}
        currentUser={currentUser}
        pendingSetups={pendingSetups}
      />
    </ClientOnly>
  );
};

export default ReservationsPage;
