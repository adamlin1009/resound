import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";

interface IParams {
  listingId: string;
}

export default async function checkUserPayment(params: IParams): Promise<{
  hasReservation: boolean;
  hasSuccessfulPayment: boolean;
  canContact: boolean;
}> {
  try {
    const { listingId } = params;
    
    // Get authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        hasReservation: false,
        hasSuccessfulPayment: false,
        canContact: false
      };
    }

    // Check if authenticated user has any successful reservations for this listing
    const reservation = await prisma.reservation.findFirst({
      where: {
        listingId: listingId,
        userId: currentUser.id
      },
      include: {
        listing: true
      }
    });

    // Also check if authenticated user has any successful payments for this listing
    const payment = await prisma.payment.findFirst({
      where: {
        listingId: listingId,
        userId: currentUser.id,
        status: "SUCCEEDED"
      }
    });

    return {
      hasReservation: !!reservation,
      hasSuccessfulPayment: !!payment,
      canContact: !!reservation || !!payment
    };
  } catch (error: any) {
    return {
      hasReservation: false,
      hasSuccessfulPayment: false,
      canContact: false
    };
  }
}