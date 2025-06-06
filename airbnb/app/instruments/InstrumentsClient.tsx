"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeUser, safeListing } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  listings: safeListing[];
  currentUser?: SafeUser | null;
  pendingSetups?: number;
  ownerReservations?: any[];
};

function InstrumentsClient({ listings, currentUser, pendingSetups = 0, ownerReservations = [] }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  const onDelete = useCallback(
    (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/listings/${id}`)
        .then(() => {
          toast.info("Instrument listing deleted");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error);
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  return (
    <Container>
      <Heading title="My Instruments" subtitle="Instruments you're lending" />
      
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
                const pendingReservation = ownerReservations.find(
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
        {listings.map((listing: any) => (
          <ListingCard
            key={listing.id}
            data={listing}
            actionId={listing.id}
            onAction={onDelete}
            disabled={deletingId === listing.id}
            actionLabel="Delete instrument"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
}

export default InstrumentsClient;
