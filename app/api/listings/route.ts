import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { geocodeLocation, buildLocationString } from "@/lib/geocoding";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {
    title,
    description,
    imageSrc,
    category,
    instrumentType,
    city,
    state,
    zipCode,
    exactAddress,
    price,
    experienceLevel,
    pickupStartTime,
    pickupEndTime,
    returnStartTime,
    returnEndTime,
    availableDays,
  } = body;

  // Validate required fields (imageSrc and zipCode are optional)
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!description) missingFields.push('description');
  if (!category) missingFields.push('category');
  if (!state) missingFields.push('state');
  if (!city) missingFields.push('city');
  if (!exactAddress) missingFields.push('exactAddress');
  
  if (missingFields.length > 0) {
    return NextResponse.json({ 
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields 
    }, { status: 400 });
  }

  // Validate image array
  if (imageSrc !== undefined) {
    if (!Array.isArray(imageSrc)) {
      return NextResponse.json(
        { error: "imageSrc must be an array" },
        { status: 400 }
      );
    }

    // Validate max 10 images
    if (imageSrc.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed per listing" },
        { status: 400 }
      );
    }

    // Validate each image is a string
    if (!imageSrc.every((img: any) => typeof img === "string")) {
      return NextResponse.json(
        { error: "All images must be strings" },
        { status: 400 }
      );
    }
  }

  // Validate price
  const priceNum = parseInt(price, 10);
  if (!price || isNaN(priceNum) || priceNum <= 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  // Validate experience level (removed condition rating validation)
  if (!experienceLevel || experienceLevel < 1 || experienceLevel > 4) {
    return NextResponse.json({ error: 'Experience level must be between 1-4' }, { status: 400 });
  }

  // Geocode the address with fallback options
  let coordinates = null;
  try {
    // Try exact address first
    coordinates = await geocodeLocation(exactAddress);
    
    // If that fails, try city, state, zipCode combination
    if (!coordinates) {
      const fallbackAddress = buildLocationString(city, state, zipCode);
      coordinates = await geocodeLocation(fallbackAddress);
    }
  } catch (error) {
    // Continue without coordinates rather than failing the listing creation
  }

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc: imageSrc || [],
      category,
      instrumentType: instrumentType || null,
      experienceLevel,
      city,
      state,
      zipCode: zipCode || null,
      exactAddress,
      latitude: coordinates?.lat || null,
      longitude: coordinates?.lng || null,
      price: priceNum,
      userId: currentUser.id,
      pickupStartTime: pickupStartTime || "09:00",
      pickupEndTime: pickupEndTime || "17:00",
      returnStartTime: returnStartTime || "09:00",
      returnEndTime: returnEndTime || "17:00",
      availableDays: availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
  });

  return NextResponse.json(listen);
}
