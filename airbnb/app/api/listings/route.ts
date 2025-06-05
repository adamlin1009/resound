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
    exactAddress,
    price,
    conditionRating,
    experienceLevel,
  } = body;

  // Validate required fields (imageSrc and zipCode are optional)
  if (!title || !description || !category || !state || !city || !exactAddress) {
    console.error('Missing required fields:', { title: !!title, description: !!description, category: !!category, state: !!state, city: !!city, exactAddress: !!exactAddress });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate price
  const priceNum = parseInt(price, 10);
  if (!price || isNaN(priceNum) || priceNum <= 0) {
    console.error('Invalid price:', price);
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  // Validate condition and experience
  if (!conditionRating || conditionRating < 1 || conditionRating > 10) {
    console.error('Invalid condition rating:', conditionRating);
    return NextResponse.json({ error: 'Condition rating must be between 1-10' }, { status: 400 });
  }
  
  if (!experienceLevel || experienceLevel < 1 || experienceLevel > 5) {
    console.error('Invalid experience level:', experienceLevel);
    return NextResponse.json({ error: 'Experience level must be between 1-5' }, { status: 400 });
  }

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc: imageSrc || '',
      category,
      conditionRating,
      experienceLevel,
      city,
      state,
      zipCode: zipCode || null,
      exactAddress,
      price: priceNum,
      userId: currentUser.id,
    },
  });

  return NextResponse.json(listen);
}
