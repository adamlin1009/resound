"use client";

import useUSLocations from "@/hook/useUSLocations";
import { useCoordinates } from "@/hook/useCoordinates";
import useMessages from "@/hook/useMessages";
import useLoginModel from "@/hook/useLoginModal";
import { SafeUser } from "@/types";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import { IconType } from "react-icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Avatar from "../Avatar";
import Button from "../Button";
import ListingCategory from "./ListingCategory";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

type Props = {
  user: SafeUser;
  description: string;
  conditionRating: number;
  experienceLevel: number;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
  city: string | null;
  state: string;
  zipCode: string | null;
  listingId: string;
  currentUser?: SafeUser | null;
  hasPaidReservation?: boolean;
};

function ListingInfo({
  user,
  description,
  conditionRating,
  experienceLevel,
  category,
  city,
  state,
  zipCode,
  listingId,
  currentUser,
  hasPaidReservation = false,
}: Props) {
  const { formatLocation } = useUSLocations();
  const { startConversation } = useMessages();
  const loginModal = useLoginModel();
  const router = useRouter();
  const [isContactingOwner, setIsContactingOwner] = useState(false);
  
  // Memoize the location object to prevent infinite re-renders
  const location = useMemo(() => ({
    city: city || undefined,
    state,
    zipCode: zipCode || undefined
  }), [city, state, zipCode]);
  
  const locationDisplay = formatLocation(location);
  const { coordinates } = useCoordinates(location);

  const handleContactOwner = async () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    if (currentUser.id === user.id) {
      toast.error("You cannot message yourself");
      return;
    }

    try {
      setIsContactingOwner(true);
      await startConversation(listingId);
      router.push('/messages');
      toast.success("Conversation started!");
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      if (error.message.includes("rental payment")) {
        toast.error("You can only message the owner after making a rental payment");
      } else {
        toast.error("Failed to start conversation. Please try again.");
      }
    } finally {
      setIsContactingOwner(false);
    }
  };

  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className=" text-xl font-semibold flex flex-row items-center gap-2">
          <div>Lent by {user?.name}</div>
          <Avatar src={user?.image} userName={user?.name} />
        </div>
        <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
          <p>Condition: {conditionRating}/10</p>
          <p>Level: {experienceLevel === 1 ? 'Beginner' : experienceLevel === 2 ? 'Intermediate' : experienceLevel === 3 ? 'Advanced' : experienceLevel === 4 ? 'Expert' : 'Professional'}</p>
        </div>
        {currentUser && currentUser.id !== user.id && hasPaidReservation && (
          <div className="mt-4">
            <Button
              label={isContactingOwner ? "Starting conversation..." : "Contact Owner"}
              onClick={handleContactOwner}
              disabled={isContactingOwner}
              outline
              small
            />
          </div>
        )}
      </div>
      <hr />
      {category && (
        <ListingCategory
          icon={category.icon}
          label={category?.label}
          description={category?.description}
        />
      )}
      <hr />
      <div className="flex flex-col">
        <p className="text-4xl font-serif font-bold text-amber-700">
          resound<span className="text-amber-900">protect</span>
        </p>
        <p className="text-neutral-500 pt-3">
          Every rental includes protection from lender cancellations,
          instrument inaccuracies, and instrument damage coverage.
        </p>
        <p className="text-amber-900 font-bold underline pt-3 cursor-pointer">
          Learn more
        </p>
      </div>
      <hr />
      <p className="text-lg font-light text-neutral-500">{description}</p>
      <hr />
      <p className="text-xl font-semibold">Pickup location</p>
      <p className="text-lg font-medium text-neutral-700">{locationDisplay}</p>
      <Map 
        center={coordinates || undefined}
        city={city || undefined}
        state={state}
        zipCode={zipCode || undefined}
      />
    </div>
  );
}

export default ListingInfo;
