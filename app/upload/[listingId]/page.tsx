import { redirect } from "next/navigation";
import prisma from "@/lib/prismadb";
import MobileUploadClient from "./MobileUploadClient";
import { getDemoListingById, isDemoMode } from "@/lib/demoData";

interface MobileUploadPageProps {
  params: Promise<{
    listingId: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function MobileUploadPage({ 
  params, 
  searchParams 
}: MobileUploadPageProps) {
  const { listingId } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  if (isDemoMode()) {
    const listing = getDemoListingById(listingId);

    if (!listing) {
      redirect("/");
    }

    return (
      <MobileUploadClient
        listing={{
          id: listing.id,
          title: listing.title,
          currentImages: listing.imageSrc,
          ownerName: listing.user.name || "Demo owner",
        }}
        token={token}
        expiresAt={new Date(Date.now() + 30 * 60 * 1000)}
      />
    );
  }

  // Validate the token
  const uploadToken = await prisma.uploadToken.findFirst({
    where: {
      token,
      listingId,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!uploadToken) {
    redirect("/");
  }

  return (
    <MobileUploadClient
      listing={{
        id: uploadToken.listing.id,
        title: uploadToken.listing.title,
        currentImages: uploadToken.listing.imageSrc,
        ownerName: uploadToken.listing.user.name || "Owner",
      }}
      token={token}
      expiresAt={uploadToken.expiresAt}
    />
  );
}
