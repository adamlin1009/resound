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
  index?: number;
};

const levelLabel = (level?: number | null) =>
  level === 1
    ? "Beginner"
    : level === 2
    ? "Intermediate"
    : level === 3
    ? "Advanced"
    : level === 4
    ? "Professional"
    : "Beginner";

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
  index = 0,
}: Props) {
  const router = useRouter();
  const { formatLocationShort } = useUSLocations();

  let city = data.city;
  let state = data.state;
  if (state && state.length > 2 && !state.includes(",")) {
    city = state;
    state = "CA";
  }
  const locationDisplay = formatLocationShort({ city: city || undefined, state });

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [onAction, actionId, disabled],
  );

  const price = useMemo(() => {
    if (reservation) return reservation.totalPrice;
    return data.price;
  }, [reservation, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${format(start, "PP")} → ${format(end, "PP")}`;
  }, [reservation]);

  const isCanceled = reservation?.status === "CANCELED";
  const isCompleted = reservation?.status === "COMPLETED";
  const isInactive = isCanceled || isCompleted;

  const handleCardClick = useCallback(() => {
    if (reservation) {
      router.push(`/rentals/${reservation.id}/manage`);
    } else {
      router.push(`/listings/${data.id}`);
    }
  }, [reservation, data.id, router]);

  const lotNumber = useMemo(() => {
    const seed = (data.id || "").slice(-3);
    const numeric = parseInt(seed, 16);
    const safe = Number.isFinite(numeric) ? numeric : index + 1;
    return String((safe % 999) + 1).padStart(3, "0");
  }, [data.id, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={handleCardClick}
      className={`group relative cursor-pointer border border-rule bg-paper-ivory transition duration-500 hover:border-ink/60 hover:shadow-archive ${
        isInactive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-rule/80 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-archive text-ink-muted">
          Lot № {lotNumber}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-archive text-ink-muted">
          {data.instrumentType ? data.instrumentType : data.category}
        </span>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-paper-warm">
        {data.imageSrc && data.imageSrc.length > 0 && data.imageSrc[0] ? (
          <OptimizedImage
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            src={data.imageSrc[0]}
            alt={data.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-warm">
            <span className="archive-label">No plate available</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="absolute right-3 top-3">
          <HeartButton listingId={data.id} currentUser={currentUser} />
        </div>

        {data.imageSrc && data.imageSrc.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 border border-paper/30 bg-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper backdrop-blur">
            <TbPhoto size={12} />
            {String(data.imageSrc.length).padStart(2, "0")} plates
          </div>
        )}

        {(isCanceled || isCompleted) && (
          <div className="absolute left-3 top-3">
            <span className="bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-archive text-paper">
              {isCanceled ? "Withdrawn" : "Returned"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-display text-[19px] leading-tight text-ink line-clamp-2">
          {data.title}
        </h3>

        <div className="flex items-baseline justify-between gap-3 border-t border-rule/80 pt-3">
          <div className="flex flex-col">
            <span className="archive-label">Custodian in</span>
            <span className="font-display text-[14px] text-ink">
              {locationDisplay}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="archive-label">Min. level</span>
            <span className="font-display text-[14px] text-ink">
              {levelLabel(data.experienceLevel)}
            </span>
          </div>
        </div>

        {reservationDate && (
          <div className="border-t border-rule/80 pt-3">
            <span className="archive-label">Window</span>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">
              {reservationDate}
            </p>
          </div>
        )}

        <div className="flex items-end justify-between border-t border-rule/80 pt-3">
          <div className="flex flex-col">
            <span className="archive-label">
              {reservation ? "Total" : "Per diem"}
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-[26px] leading-none text-ink">
                ${price}
              </span>
              {!reservation && (
                <span className="editorial-italic text-[14px] text-ink-muted">
                  / day
                </span>
              )}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-archive text-ink-muted opacity-0 transition group-hover:opacity-100">
            View →
          </span>
        </div>

        {showManageButton && onManage && (
          <div className="flex gap-2 pt-2">
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
  );
}

export default React.memo(ListingCard, (prevProps, nextProps) => {
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
    prevProps.onManage === nextProps.onManage &&
    prevProps.index === nextProps.index
  );
});
