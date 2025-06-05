import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { ownerId: currentUser.id },
          { renterId: currentUser.id }
        ]
      },
      include: {
        listing: { select: { title: true, imageSrc: true } },
        owner: { select: { name: true, image: true } },
        renter: { select: { name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Find existing conversation or create new one
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId: listingId,
        ownerId: listing.userId,
        renterId: currentUser.id
      },
      include: {
        listing: { select: { title: true, imageSrc: true } },
        owner: { select: { name: true, image: true } },
        renter: { select: { name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } }
          }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId: listingId,
          ownerId: listing.userId,
          renterId: currentUser.id
        },
        include: {
          listing: { select: { title: true, imageSrc: true } },
          owner: { select: { name: true, image: true } },
          renter: { select: { name: true, image: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, name: true, image: true } }
            }
          }
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}