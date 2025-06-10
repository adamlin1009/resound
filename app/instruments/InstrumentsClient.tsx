"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeUser, safeListing } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import useConfirmModal from "@/hook/useConfirmModal";

type Props = {
  listings: safeListing[];
  currentUser?: SafeUser | null;
};

function InstrumentsClient({ listings, currentUser }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const confirmModal = useConfirmModal();

  const onDelete = useCallback(
    (id: string) => {
      const listing = listings.find(l => l.id === id);
      
      confirmModal.onOpen({
        title: "Delete Listing",
        message: `Are you sure you want to delete "${listing?.title || 'this listing'}"? This action cannot be undone.`,
        actionLabel: "Delete",
        onConfirm: () => {
          setDeletingId(id);

          axios
            .delete(`/api/listings/${id}`)
            .then(() => {
              toast.success("Instrument listing deleted");
              router.refresh();
            })
            .catch((error) => {
              // Error handled internally
              const errorMessage = error?.response?.data?.error || "Failed to delete listing";
              toast.error(errorMessage);
            })
            .finally(() => {
              setDeletingId("");
            });
        }
      });
    },
    [router, confirmModal, listings]
  );

  return (
    <Container>
      <Heading title="My Instruments" subtitle="Manage your instrument listings" />
      
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            data={listing}
            actionId={listing.id}
            onAction={onDelete}
            disabled={deletingId === listing.id}
            actionLabel="Delete listing"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
}

export default InstrumentsClient;
