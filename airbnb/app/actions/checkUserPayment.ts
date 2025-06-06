import prisma from "@/lib/prismadb";

interface IParams {
  listingId: string;
  userId: string;
}

export default async function checkUserPayment(params: IParams) {
  try {
    const { listingId, userId } = params;

    // Check if user has any successful reservations for this listing
    const reservation = await prisma.reservation.findFirst({
      where: {
        listingId: listingId,
        userId: userId
      },
      include: {
        listing: true
      }
    });

    // Also check if user has any successful payments for this listing
    const payment = await prisma.payment.findFirst({
      where: {
        listingId: listingId,
        userId: userId,
        status: "SUCCEEDED"
      }
    });

    return {
      hasReservation: !!reservation,
      hasSuccessfulPayment: !!payment,
      canContact: !!reservation || !!payment
    };
  } catch (error: any) {
    console.error("Error checking user payment:", error);
    return {
      hasReservation: false,
      hasSuccessfulPayment: false,
      canContact: false
    };
  }
}