"use client";

import useUSLocations from "@/hook/useUSLocations";
import { SafeReservation, SafeUser, safeListing } from "@/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { TbPhoto } from "react-icons/tb";
import Button from "../Button";
import HeartButton from "../HeartButton";
import OptimizedImage from "../ui/OptimizedImage";

type Props = {
  data: safeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
  showManageButton?: boolean;
  onManage?: () => void;
  priority?: boolean;
};

function ListingCard({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
  showManageButton,
  onManage,
  priority = false,
}: Props) {
  const router = useRouter();
  const { formatLocationShort } = useUSLocations();

  // Handle incorrectly stored address data
  let city = data.city;
  let state = data.state;
  
  // If state looks like a city name (not a 2-letter code), assume data is swapped
  if (state && state.length > 2 && !state.includes(',')) {
    city = state; // Use state as city
    state = 'CA'; // Default to CA since most listings seem to be there
  }
  
  const locationDisplay = formatLocationShort({ city: city || undefined, state: state });

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (disabled) return;

      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  const price = useMemo(() => {
    if (reservation) {
      return reservation.totalPrice;
    }

    return data.price;
  }, [reservation, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  const isCanceled = reservation?.status === "CANCELED";
  const isCompleted = reservation?.status === "COMPLETED";
  const isInactive = isCanceled || isCompleted;

  const handleCardClick = useCallback(() => {
    // If this card represents a reservation, go to the rental management page
    if (reservation) {
      router.push(`/rentals/${reservation.id}/manage`);
    } else {
      router.push(`/listings/${data.id}`);
    }
  }, [reservation, data.id, router]);

  return (
    <div
      onClick={handleCardClick}
      className={`col-span-1 cursor-pointer group rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md ${isInactive ? 'opacity-50' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="aspect-[4/3] w-full relative overflow-hidden rounded-lg bg-neutral-100">
            {data.imageSrc && data.imageSrc.length > 0 && data.imageSrc[0] ? (
              <OptimizedImage
                fill
                className="object-cover h-full w-full group-hover:scale-105 transition duration-300"
                src={data.imageSrc[0]}
                alt={data.title}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
            ) : (
              <div className="aspect-square w-full h-full bg-neutral-100 flex items-center justify-center rounded-lg">
                <span className="text-neutral-500 text-sm">No image</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <HeartButton listingId={data.id} currentUser={currentUser} />
            </div>
            {data.imageSrc && data.imageSrc.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <TbPhoto size={13} />
                {data.imageSrc.length}
              </div>
            )}
          </div>
          <div className="font-semibold text-base text-neutral-950 line-clamp-2">
            {data.title}
          </div>
          <div className="font-light text-sm text-neutral-500">
            {reservationDate || (
              <>
                {data.instrumentType ? (
                  <span>{data.instrumentType} • {data.category}</span>
                ) : (
                  data.category
                )}
              </>
            )}
            {isCanceled && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                CANCELED
              </span>
            )}
            {isCompleted && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                COMPLETED
              </span>
            )}
          </div>
          <div className="flex flex-row gap-2 text-sm text-neutral-600">
            <span>Min. Level: {
              data.experienceLevel === 1 ? 'Beginner' : 
              data.experienceLevel === 2 ? 'Intermediate' : 
              data.experienceLevel === 3 ? 'Advanced' : 
              'Professional'
            }</span>
          </div>
          <div className="font-medium text-sm text-neutral-700">
            {locationDisplay}
          </div>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex gap-1 font-semibold text-neutral-950">
              ${price} {!reservation && <div className="font-light"> per day</div>}
            </div>
          </div>
          {showManageButton && onManage && (
            <div className="flex gap-2">
              <Button
                disabled={disabled}
                small
                label="Manage"
                onClick={(e) => {
                  e.stopPropagation();
                  onManage();
                }}
              />
              {onAction && actionLabel && (
                <Button
                  disabled={disabled}
                  small
                  outline
                  label={actionLabel}
                  onClick={handleCancel}
                />
              )}
            </div>
          )}
          {!showManageButton && onAction && actionLabel && !isInactive && (
            <Button
              disabled={disabled}
              small
              label={actionLabel}
              onClick={handleCancel}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default React.memo(ListingCard, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.price === nextProps.data.price &&
    prevProps.data.title === nextProps.data.title &&
    prevProps.data.imageSrc === nextProps.data.imageSrc &&
    prevProps.data.category === nextProps.data.category &&
    prevProps.data.instrumentType === nextProps.data.instrumentType &&
    prevProps.data.experienceLevel === nextProps.data.experienceLevel &&
    prevProps.data.city === nextProps.data.city &&
    prevProps.data.state === nextProps.data.state &&
    prevProps.reservation?.id === nextProps.reservation?.id &&
    prevProps.reservation?.status === nextProps.reservation?.status &&
    prevProps.reservation?.totalPrice === nextProps.reservation?.totalPrice &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.actionLabel === nextProps.actionLabel &&
    prevProps.actionId === nextProps.actionId &&
    prevProps.currentUser?.id === nextProps.currentUser?.id &&
    prevProps.showManageButton === nextProps.showManageButton &&
    prevProps.onManage === nextProps.onManage
  );
});
