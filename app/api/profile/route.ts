import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      image,
      experienceLevel,
      bio,
      preferredInstruments,
    } = body;

    // Validate experience level
    if (experienceLevel && (experienceLevel < 1 || experienceLevel > 4)) {
      return NextResponse.json(
        { error: "Experience level must be between 1-4" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: name || currentUser.name,
        image: image || currentUser.image,
        experienceLevel: experienceLevel || currentUser.experienceLevel,
        bio: bio,
        preferredInstruments: preferredInstruments || [],
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile", code: "PROFILE_UPDATE_FAILED" },
      { status: 500 }
    );
  }
}