import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    title,
    description,
    imageSrc,
    category,
    city,
    state,
    zipCode,
    price,
    conditionRating,
    experienceLevel,
  } = body;

  // Validate required fields (city and zipCode are optional)
  const requiredFields = [title, description, imageSrc, category, state, price, conditionRating, experienceLevel];
  if (requiredFields.some(field => !field)) {
    return NextResponse.error();
  }

  // Validate ranges
  if (conditionRating < 1 || conditionRating > 10) {
    return NextResponse.error();
  }
  
  if (experienceLevel < 1 || experienceLevel > 5) {
    return NextResponse.error();
  }

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      conditionRating,
      experienceLevel,
      city: city || null,
      state,
      zipCode: zipCode || null,
      price: parseInt(price, 10),
      userId: currentUser.id,
    },
  });

  return NextResponse.json(listen);
}
