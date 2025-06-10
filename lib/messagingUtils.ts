import { Reservation } from "@prisma/client";
import { TIME_CONSTANTS } from "@/constants";

export function getMessagingStatus(reservation: Reservation | null) {
  if (!reservation) {
    return {
      canMessage: false,
      reason: "No reservation found",
      expiresAt: null
    };
  }

  const now = new Date();

  // PENDING reservations can message
  if (reservation.status === "PENDING") {
    return {
      canMessage: true,
      reason: "Reservation pending",
      expiresAt: null
    };
  }

  // ACTIVE reservations can always message
  if (reservation.status === "ACTIVE") {
    return {
      canMessage: true,
      reason: "Rental active",
      expiresAt: null
    };
  }

  // COMPLETED reservations can message for 30 days after end date
  if (reservation.status === "COMPLETED") {
    const thirtyDaysAfterEnd = new Date(reservation.endDate);
    thirtyDaysAfterEnd.setDate(thirtyDaysAfterEnd.getDate() + TIME_CONSTANTS.MESSAGE_EXPIRY_DAYS);
    
    if (now <= thirtyDaysAfterEnd) {
      const daysRemaining = Math.ceil((thirtyDaysAfterEnd.getTime() - now.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
      return {
        canMessage: true,
        reason: `Rental completed - ${daysRemaining} days remaining to message`,
        expiresAt: thirtyDaysAfterEnd
      };
    } else {
      return {
        canMessage: false,
        reason: `Messaging period expired (${TIME_CONSTANTS.MESSAGE_EXPIRY_DAYS} days after rental)`,
        expiresAt: thirtyDaysAfterEnd
      };
    }
  }

  // CANCELED reservations cannot message
  if (reservation.status === "CANCELED") {
    return {
      canMessage: false,
      reason: "Reservation was canceled",
      expiresAt: null
    };
  }

  return {
    canMessage: false,
    reason: "Unknown reservation status",
    expiresAt: null
  };
}

export function formatMessagingExpiry(expiresAt: Date | null): string {
  if (!expiresAt) return "";
  
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
  
  if (daysRemaining < 0) {
    return "Messaging expired";
  } else if (daysRemaining === 0) {
    return "Messaging expires today";
  } else if (daysRemaining === 1) {
    return "Messaging expires tomorrow";
  } else if (daysRemaining <= 7) {
    return `Messaging expires in ${daysRemaining} days`;
  } else {
    return `Messaging expires on ${expiresAt.toLocaleDateString()}`;
  }
}