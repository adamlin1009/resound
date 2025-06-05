import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

export async function GET() {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}