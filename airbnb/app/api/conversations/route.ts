import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First get conversations without the listing relation to avoid errors
    const conversationsWithoutListing = await prisma.conversation.findMany({
      where: {
        OR: [
          { ownerId: currentUser.id },
          { renterId: currentUser.id }
        ]
      },
      include: {
        owner: true,
        renter: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get listing IDs
    const listingIds = conversationsWithoutListing.map(c => c.listingId);
    
    // Fetch listings separately
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds }
      }
    });
    
    // Create a map for quick lookup
    const listingMap = new Map(listings.map(l => [l.id, l]));
    
    // Combine the data
    const conversations = conversationsWithoutListing.map(conv => ({
      ...conv,
      listing: listingMap.get(conv.listingId) || null
    }));
    
    // Filter out conversations with deleted listings and transform the data
    const safeConversations = conversations
      .filter(conv => conv.listing !== null) // Remove conversations for deleted listings
      .map(conv => ({
        ...conv,
        listing: conv.listing ? {
          id: conv.listing.id,
          title: conv.listing.title || 'Untitled',
          imageSrc: conv.listing.imageSrc || ''
        } : null,
        owner: {
          id: conv.owner.id,
          name: conv.owner.name || 'User',
          image: conv.owner.image || null
        },
        renter: {
          id: conv.renter.id,
          name: conv.renter.name || 'User',
          image: conv.renter.image || null
        },
        messages: conv.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          sender: {
            id: msg.sender.id,
            name: msg.sender.name || 'User',
            image: msg.sender.image || null
          }
        }))
      }));

    return NextResponse.json(safeConversations);
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    
    // Return more specific error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || "Internal server error"
      : "Internal server error";
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, ownerId, renterId } = body;

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

    // Determine the owner and renter IDs
    let finalOwnerId = ownerId || listing.userId;
    let finalRenterId = renterId || currentUser.id;

    // If current user is the owner, swap the roles
    if (currentUser.id === listing.userId && renterId) {
      finalOwnerId = currentUser.id;
      finalRenterId = renterId;
    }

    if (finalOwnerId === finalRenterId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Check if there's a valid reservation for this conversation
    const validReservation = await prisma.reservation.findFirst({
      where: {
        listingId: listingId,
        userId: finalRenterId,
        status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!validReservation) {
      return NextResponse.json({ 
        error: "A valid rental reservation is required to start a conversation" 
      }, { status: 403 });
    }

    // For completed reservations, allow messaging for 30 days after end date
    if (validReservation.status === 'COMPLETED') {
      const thirtyDaysAfterEnd = new Date(validReservation.endDate);
      thirtyDaysAfterEnd.setDate(thirtyDaysAfterEnd.getDate() + 30);
      
      if (new Date() > thirtyDaysAfterEnd) {
        return NextResponse.json({ 
          error: "Cannot start new conversations more than 30 days after rental completion" 
        }, { status: 403 });
      }
    }

    // Check if there's a successful payment for this reservation
    const payment = await prisma.payment.findFirst({
      where: {
        userId: finalRenterId,
        listingId: listingId,
        status: 'SUCCEEDED'
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: "A successful payment is required to start a conversation" 
      }, { status: 403 });
    }

    // Find existing conversation or create new one
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId: listingId,
        ownerId: finalOwnerId,
        renterId: finalRenterId
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
          ownerId: finalOwnerId,
          renterId: finalRenterId
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