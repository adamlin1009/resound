"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
};

function RentalsClient({ reservations, currentUser }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  const onCancel = useCallback(
    (id: string) => {
      if (!confirm("Are you sure you want to cancel this rental?")) return;
      
      setDeletingId(id);

      axios
        .post(`/api/reservations/${id}/cancel`, { reason: "User requested cancellation" })
        .then((response) => {
          toast.success(response.data.message || "Rental cancelled");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Failed to cancel rental");
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  return (
    <Container>
      <Heading
        title="My Rentals"
        subtitle="Instruments you've rented and upcoming rentals"
      />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {reservations.map((reservation) => (
          <ListingCard
            key={reservation.id}
            data={reservation.listing}
            reservation={reservation}
            actionId={reservation.id}
            onAction={onCancel}
            disabled={deletingId === reservation.id}
            actionLabel="Cancel rental"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
}

export default RentalsClient;
