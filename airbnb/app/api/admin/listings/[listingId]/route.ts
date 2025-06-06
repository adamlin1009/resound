import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

interface IParams {
  listingId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await params;

    // Check if listing has active reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        listingId: listingId,
        endDate: {
          gte: new Date()
        }
      }
    });

    if (activeReservations > 0) {
      return NextResponse.json({ 
        error: "Cannot delete listing with active reservations" 
      }, { status: 400 });
    }

    await prisma.listing.delete({
      where: { id: listingId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}