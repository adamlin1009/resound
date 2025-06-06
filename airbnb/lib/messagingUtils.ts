import { Reservation } from "@prisma/client";

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
    thirtyDaysAfterEnd.setDate(thirtyDaysAfterEnd.getDate() + 30);
    
    if (now <= thirtyDaysAfterEnd) {
      const daysRemaining = Math.ceil((thirtyDaysAfterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        canMessage: true,
        reason: `Rental completed - ${daysRemaining} days remaining to message`,
        expiresAt: thirtyDaysAfterEnd
      };
    } else {
      return {
        canMessage: false,
        reason: "Messaging period expired (30 days after rental)",
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
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
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