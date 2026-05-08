import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimiters } from "@/lib/rateLimiter";
import { getDemoCurrentUser, isDemoMode } from "@/lib/demoData";

// Define the expected shape of the context parameter for the route handlers
interface RouteContext {
  params: {
    listingId: string;
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  if (isDemoMode()) {
    const { listingId } = await params;
    const user = getDemoCurrentUser();
    return NextResponse.json({
      ...user,
      favoriteIds: Array.from(new Set([...(user.favoriteIds || []), listingId])),
    });
  }

  return withRateLimit(request, rateLimiters.favorites, async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { listingId } = await params;

  if (!listingId) {
    throw new Error("Invalid Id");
  }

  let favoriteIds = [...(currentUser.favoriteIds || [])];

  favoriteIds.push(listingId);

  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      favoriteIds,
    },
  });

  return NextResponse.json(user);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  if (isDemoMode()) {
    const { listingId } = await params;
    const user = getDemoCurrentUser();
    return NextResponse.json({
      ...user,
      favoriteIds: (user.favoriteIds || []).filter((id) => id !== listingId),
    });
  }

  return withRateLimit(request, rateLimiters.favorites, async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { listingId } = await params;

  if (!listingId) {
    throw new Error("Invalid Id");
  }

  let favoriteIds = [...(currentUser.favoriteIds || [])];

  favoriteIds = favoriteIds.filter((id) => id !== listingId);

  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      favoriteIds,
    },
  });

  return NextResponse.json(user);
  });
}
