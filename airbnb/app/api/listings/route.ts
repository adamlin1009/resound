import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { geocodeLocation, buildLocationString } from "@/lib/geocoding";
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
    console.error('Missing required fields:', missingFields);
    console.error('Received data:', { title, description, category, state, city, exactAddress });
    return NextResponse.json({ 
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields 
    }, { status: 400 });
  }

  // Validate price
  const priceNum = parseInt(price, 10);
  if (!price || isNaN(priceNum) || priceNum <= 0) {
    console.error('Invalid price:', price);
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  // Validate experience level (removed condition rating validation)
  if (!experienceLevel || experienceLevel < 1 || experienceLevel > 4) {
    console.error('Invalid experience level:', experienceLevel);
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
    console.error('Geocoding failed:', error);
    // Continue without coordinates rather than failing the listing creation
  }

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc: imageSrc || '',
      category,
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
