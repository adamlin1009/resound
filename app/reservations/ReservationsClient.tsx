"use client";

import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import useConfirmModal from "@/hook/useConfirmModal";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
  pendingSetups?: number;
};

function ReservationsClient({ reservations, currentUser, pendingSetups = 0 }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const confirmModal = useConfirmModal();

  const onCancel = useCallback(
    (id: string) => {
      const reservation = reservations.find(r => r.id === id);
      const renterName = reservation?.user?.name || "the renter";
      
      confirmModal.onOpen({
        title: "Cancel Rental",
        message: `Are you sure you want to cancel this rental from ${renterName}? The renter will be notified and may request a refund.`,
        actionLabel: "Cancel Rental",
        onConfirm: () => {
          setDeletingId(id);

          axios
            .delete(`/api/reservations/${id}`)
            .then(() => {
              toast.success("Rental cancelled successfully");
              router.refresh();
            })
            .catch((error) => {
              toast.error(error?.response?.data?.error || "Failed to cancel rental");
            })
            .finally(() => {
              setDeletingId("");
            });
        }
      });
    },
    [router, confirmModal, reservations]
  );

  // Filter out canceled reservations from incoming rentals view
  const activeReservations = reservations.filter(r => r.status !== "CANCELED");

  return (
    <Container>
      <Heading title="Incoming Rentals" subtitle="Musicians renting your instruments" />
      
      {/* Pending Setups Alert */}
      {pendingSetups > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-amber-800 font-medium">
                You have {pendingSetups} rental{pendingSetups > 1 ? 's' : ''} awaiting setup
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Please set up pickup and return details for your new bookings.
              </p>
            </div>
            <button
              onClick={() => {
                // Find the first reservation that needs setup
                const pendingReservation = activeReservations.find(
                  res => res.rentalStatus === 'PENDING'
                );
                if (pendingReservation) {
                  router.push(`/rentals/${pendingReservation.id}/manage`);
                }
              }}
              className="ml-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm"
            >
              Set Up Now
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {activeReservations.map((reservation) => (
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

export default ReservationsClient;
