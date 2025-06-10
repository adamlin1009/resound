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
import { toast } from "@/components/Toast";
import Avatar from "../Avatar";
import Button from "../Button";
import ListingCategory from "./ListingCategory";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

type Props = {
  user: SafeUser;
  description: string;
  experienceLevel: number;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
  instrumentType?: string | null;
  city: string | null;
  state: string;
  zipCode: string | null;
  listingId: string;
  currentUser?: SafeUser | null;
  hasPaidReservation?: boolean;
  exactAddress?: string;
};

function ListingInfo({
  user,
  description,
  experienceLevel,
  category,
  instrumentType,
  city,
  state,
  zipCode,
  listingId,
  currentUser,
  hasPaidReservation = false,
  exactAddress,
}: Props) {
  const { formatLocation } = useUSLocations();
  const { startConversation } = useMessages();
  const loginModal = useLoginModel();
  const router = useRouter();
  const [isContactingOwner, setIsContactingOwner] = useState(false);
  
  // Handle incorrectly stored address data
  let correctedCity = city;
  let correctedState = state;
  
  // If state looks like a city name (not a 2-letter code), assume data is swapped
  if (state && state.length > 2 && !state.includes(',')) {
    correctedCity = state; // Use state as city
    correctedState = 'CA'; // Default to CA
  }
  
  // Memoize the location object to prevent infinite re-renders
  const location = useMemo(() => ({
    city: correctedCity || undefined,
    state: correctedState,
    zipCode: zipCode || undefined
  }), [correctedCity, correctedState, zipCode]);
  
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
      const conversationId = await startConversation(listingId);
      if (conversationId) {
        toast.success("Conversation started!");
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          router.push('/messages');
        }, 100);
      }
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      if (error.message && error.message.includes("valid rental reservation")) {
        toast.error("You need an active rental to message the owner");
      } else if (error.message && error.message.includes("successful payment")) {
        toast.error("You need to complete payment before messaging");
      } else {
        toast.error(error.message || "Failed to start conversation");
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
          <p>Min. Level: {
            experienceLevel === 1 ? 'Beginner' : 
            experienceLevel === 2 ? 'Intermediate' : 
            experienceLevel === 3 ? 'Advanced' : 
            experienceLevel === 4 ? 'Professional' :
            'Beginner'
          }</p>
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
        <>
          <ListingCategory
            icon={category.icon}
            label={category?.label}
            description={category?.description}
          />
          {instrumentType && (
            <div className="mt-2">
              <p className="text-lg font-medium text-neutral-800">
                Instrument: {instrumentType}
              </p>
            </div>
          )}
        </>
      )}
      <hr />
      {/* <div className="flex flex-col">
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
      <hr /> */}
      <p className="text-lg font-light text-neutral-500">{description}</p>
      <hr />
      <p className="text-xl font-semibold">Pickup location</p>
      {exactAddress ? (
        <>
          <p className="text-lg font-medium text-neutral-700">{exactAddress}</p>
          <p className="text-sm text-neutral-500">{locationDisplay}</p>
        </>
      ) : (
        <>
          <p className="text-lg font-medium text-neutral-700">{locationDisplay}</p>
          {!currentUser && (
            <p className="text-sm text-neutral-500 italic">Exact address available after booking</p>
          )}
          {currentUser && currentUser.id !== user.id && !hasPaidReservation && (
            <p className="text-sm text-neutral-500 italic">Exact address available after booking</p>
          )}
        </>
      )}
      <Map 
        center={coordinates || undefined}
        city={correctedCity || undefined}
        state={correctedState}
        zipCode={zipCode || undefined}
      />
    </div>
  );
}

export default ListingInfo;
