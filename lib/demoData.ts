import { SafeReservation, SafeUser, safeListing, safeListingWithAddress } from "@/types";

export const isDemoMode = () => process.env.NEXT_PUBLIC_RESOUND_DEMO === "true";

type DemoListingParams = {
  userId?: string;
  experienceLevel?: number;
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
  instrumentType?: string;
  radius?: number;
  nationwide?: boolean;
  page?: number;
  limit?: number;
};

type DemoListingResponse = {
  listings: safeListing[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

type DemoConversation = {
  id: string;
  listingId: string;
  ownerId: string;
  renterId: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  renter: {
    id: string;
    name: string | null;
    image: string | null;
  };
  messages: Array<{
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
};

const createdAt = "2026-05-01T16:00:00.000Z";
const updatedAt = "2026-05-07T16:00:00.000Z";
const avatar = "/assets/avatar.png";

const daysFromNow = (days: number, hour = 17) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const demoUsers: SafeUser[] = [
  {
    id: "demo-user-adam",
    name: "Adam Lin",
    email: "adam.demo@resound.local",
    emailVerified: null,
    image: avatar,
    isAdmin: false,
    createdAt,
    updatedAt,
    favoriteIds: ["demo-listing-cello", "demo-listing-flute"],
    experienceLevel: 4,
    preferredInstruments: ["Violin", "Cello", "Piano"],
    bio: "Portfolio demo user for exploring Resound without live marketplace side effects.",
  },
  {
    id: "demo-user-maya",
    name: "Maya Chen",
    email: "maya.demo@resound.local",
    emailVerified: null,
    image: avatar,
    isAdmin: false,
    createdAt,
    updatedAt,
    favoriteIds: [],
    experienceLevel: 5,
    preferredInstruments: ["Cello", "Viola"],
    bio: "Chamber musician lending high-value strings to local performers.",
  },
  {
    id: "demo-user-julian",
    name: "Julian Price",
    email: "julian.demo@resound.local",
    emailVerified: null,
    image: avatar,
    isAdmin: false,
    createdAt,
    updatedAt,
    favoriteIds: [],
    experienceLevel: 4,
    preferredInstruments: ["Saxophone", "Clarinet"],
    bio: "Woodwind doubler and studio player.",
  },
  {
    id: "demo-user-nora",
    name: "Nora Valdez",
    email: "nora.demo@resound.local",
    emailVerified: null,
    image: avatar,
    isAdmin: false,
    createdAt,
    updatedAt,
    favoriteIds: [],
    experienceLevel: 3,
    preferredInstruments: ["Piano", "Trumpet"],
    bio: "Teacher and recital accompanist.",
  },
];

const ownerById = Object.fromEntries(demoUsers.map((user) => [user.id, user]));

const listingAddresses: Record<string, { exactAddress: string; latitude: number; longitude: number }> = {
  "demo-listing-cello": {
    exactAddress: "210 Symphony Hall Way, Boston, MA 02115",
    latitude: 42.3429,
    longitude: -71.0857,
  },
  "demo-listing-violin": {
    exactAddress: "54 Conservatory Lane, New York, NY 10023",
    latitude: 40.7736,
    longitude: -73.9835,
  },
  "demo-listing-grand-piano": {
    exactAddress: "901 Mission Studio, San Francisco, CA 94103",
    latitude: 37.7786,
    longitude: -122.4073,
  },
  "demo-listing-sax": {
    exactAddress: "715 Frenchmen Street, New Orleans, LA 70116",
    latitude: 29.9641,
    longitude: -90.057,
  },
  "demo-listing-flute": {
    exactAddress: "348 Lakeview Rehearsal, Chicago, IL 60613",
    latitude: 41.9454,
    longitude: -87.6553,
  },
  "demo-listing-trumpet": {
    exactAddress: "1222 South Congress Ave, Austin, TX 78704",
    latitude: 30.2501,
    longitude: -97.7493,
  },
};

export const demoListings: safeListing[] = [
  {
    id: "demo-listing-cello",
    title: "German Workshop Cello for Recitals",
    description:
      "A full-size German workshop cello with a focused lower register and clear projection. Includes a hard case, carbon-fiber bow, rosin, and setup notes for orchestral and chamber work.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/cello.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/student-cello.jpg",
    ],
    createdAt,
    category: "Strings",
    instrumentType: "Cello",
    experienceLevel: 4,
    city: "Boston",
    state: "MA",
    zipCode: "02115",
    userId: "demo-user-maya",
    price: 185,
    pickupStartTime: "10:00",
    pickupEndTime: "18:00",
    returnStartTime: "10:00",
    returnEndTime: "19:00",
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  },
  {
    id: "demo-listing-violin",
    title: "19th-Century Strad Copy Violin",
    description:
      "A responsive Stradivari-pattern violin with a warm A string and plenty of projection. Best suited for advanced students, auditions, and small ensemble performances.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/strad_copy.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/student_violin.webp",
    ],
    createdAt,
    category: "Strings",
    instrumentType: "Violin",
    experienceLevel: 4,
    city: "New York",
    state: "NY",
    zipCode: "10023",
    userId: "demo-user-adam",
    price: 150,
    pickupStartTime: "09:00",
    pickupEndTime: "17:30",
    returnStartTime: "09:00",
    returnEndTime: "17:30",
    availableDays: ["tuesday", "wednesday", "thursday", "friday", "sunday"],
  },
  {
    id: "demo-listing-grand-piano",
    title: "Yamaha C3 Grand Piano Studio Rental",
    description:
      "A well-maintained Yamaha C3 in a treated room, tuned monthly and ready for recital prep, recording sessions, or accompaniment work. Bench and page-turning light included.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/c3_yamaha.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/kawai_upright.jpg",
    ],
    createdAt,
    category: "Keyboards",
    instrumentType: "Grand Piano",
    experienceLevel: 3,
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    userId: "demo-user-nora",
    price: 300,
    pickupStartTime: "11:00",
    pickupEndTime: "20:00",
    returnStartTime: "11:00",
    returnEndTime: "20:00",
    availableDays: ["monday", "wednesday", "friday", "saturday", "sunday"],
  },
  {
    id: "demo-listing-sax",
    title: "Vintage Selmer Mark VI Alto Sax",
    description:
      "A freshly overhauled Mark VI alto saxophone with excellent intonation and a flexible jazz/classical setup. Includes case, neck strap, mouthpiece, and cleaning kit.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/semler_mark6.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/tenor_sax.webp",
    ],
    createdAt,
    category: "Woodwinds",
    instrumentType: "Alto Saxophone",
    experienceLevel: 4,
    city: "New Orleans",
    state: "LA",
    zipCode: "70116",
    userId: "demo-user-julian",
    price: 175,
    pickupStartTime: "12:00",
    pickupEndTime: "18:00",
    returnStartTime: "12:00",
    returnEndTime: "18:00",
    availableDays: ["thursday", "friday", "saturday", "sunday"],
  },
  {
    id: "demo-listing-flute",
    title: "Powell Professional Flute",
    description:
      "A handmade Powell flute with silver headjoint and clean response across registers. Ideal for orchestral excerpts, auditions, or short-term conservatory needs.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/powell_flute.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/flute.webp",
    ],
    createdAt,
    category: "Woodwinds",
    instrumentType: "Flute",
    experienceLevel: 3,
    city: "Chicago",
    state: "IL",
    zipCode: "60613",
    userId: "demo-user-julian",
    price: 135,
    pickupStartTime: "10:00",
    pickupEndTime: "16:00",
    returnStartTime: "10:00",
    returnEndTime: "16:00",
    availableDays: ["monday", "tuesday", "wednesday", "thursday"],
  },
  {
    id: "demo-listing-trumpet",
    title: "Bach Stradivarius Trumpet",
    description:
      "A reliable Bach Stradivarius trumpet with a gold brass bell and recently serviced valves. Good for pit work, recording dates, and advanced students.",
    imageSrc: [
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/bach_strad.webp",
      "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/yamaha_pro_trumpet.webp",
    ],
    createdAt,
    category: "Brass",
    instrumentType: "Trumpet",
    experienceLevel: 3,
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    userId: "demo-user-nora",
    price: 125,
    pickupStartTime: "09:30",
    pickupEndTime: "17:00",
    returnStartTime: "09:30",
    returnEndTime: "17:00",
    availableDays: ["monday", "tuesday", "friday", "saturday"],
  },
];

export function getDemoCurrentUser(): SafeUser {
  return demoUsers[0];
}

export function getDemoListings(params: DemoListingParams = {}): DemoListingResponse {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const normalizedInstrument = params.instrumentType?.toLowerCase();
  const normalizedCity = params.city?.toLowerCase();
  const normalizedState = params.state?.toLowerCase();
  const normalizedZip = params.zipCode?.toLowerCase();

  const filtered = demoListings.filter((listing) => {
    if (params.userId && listing.userId !== params.userId) return false;
    if (params.category && listing.category !== params.category) return false;
    if (params.experienceLevel && listing.experienceLevel > Number(params.experienceLevel)) return false;

    if (normalizedInstrument) {
      const haystack = `${listing.instrumentType || ""} ${listing.category} ${listing.title} ${listing.description}`.toLowerCase();
      if (!haystack.includes(normalizedInstrument)) return false;
    }

    if (!params.nationwide) {
      if (normalizedCity && !listing.city?.toLowerCase().includes(normalizedCity)) return false;
      if (normalizedState && listing.state.toLowerCase() !== normalizedState) return false;
      if (normalizedZip && listing.zipCode?.toLowerCase() !== normalizedZip) return false;
    }

    return true;
  });

  const start = (page - 1) * limit;
  const listings = filtered.slice(start, start + limit);

  return {
    listings,
    totalCount: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getDemoListingById(listingId?: string): (safeListing & { user: SafeUser }) | null {
  const listing = demoListings.find((item) => item.id === listingId);
  if (!listing) return null;
  return {
    ...listing,
    user: ownerById[listing.userId] || demoUsers[1],
  };
}

export function getDemoListingWithAddress(listingId: string): safeListingWithAddress | null {
  const listing = demoListings.find((item) => item.id === listingId);
  const address = listingId ? listingAddresses[listingId] : null;
  if (!listing || !address) return null;

  return {
    ...listing,
    exactAddress: address.exactAddress,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}

export function getDemoFavoriteListings(): safeListing[] {
  const favoriteIds = getDemoCurrentUser().favoriteIds;
  return demoListings.filter((listing) => favoriteIds.includes(listing.id));
}

function buildReservation(overrides: Partial<SafeReservation>): SafeReservation {
  const listing = getDemoListingById(overrides.listingId || "demo-listing-cello");
  const user = demoUsers.find((item) => item.id === overrides.userId) || getDemoCurrentUser();

  if (!listing) {
    throw new Error("Demo reservation listing is missing");
  }

  return {
    id: "demo-reservation",
    userId: user.id,
    listingId: listing.id,
    startDate: daysFromNow(3, 10),
    endDate: daysFromNow(7, 17),
    totalPrice: listing.price * 4,
    status: "ACTIVE",
    canceledBy: null,
    cancellationReason: null,
    stripeSessionId: "demo-checkout-session",
    rentalStatus: "READY_FOR_PICKUP",
    pickupAddress: listingAddresses[listing.id]?.exactAddress || `${listing.city}, ${listing.state}`,
    pickupInstructions: "Meet at the front desk. The instrument will be checked in its case before handoff.",
    pickupConfirmedByOwner: false,
    pickupConfirmedByRenter: false,
    returnAddress: listingAddresses[listing.id]?.exactAddress || `${listing.city}, ${listing.state}`,
    returnInstructions: "Return in the same case with the signed condition checklist.",
    returnConfirmedByOwner: false,
    returnConfirmedByRenter: false,
    ownerNotes: null,
    renterNotes: null,
    createdAt,
    canceledAt: null,
    pickupStartTime: daysFromNow(3, 10),
    pickupEndTime: daysFromNow(3, 12),
    pickupConfirmedAt: null,
    returnDeadline: daysFromNow(7, 18),
    returnStartTime: daysFromNow(7, 15),
    returnEndTime: daysFromNow(7, 18),
    returnConfirmedAt: null,
    listing,
    user,
    ...overrides,
  };
}

export const demoReservations: SafeReservation[] = [
  buildReservation({
    id: "demo-reservation-renter-ready",
    userId: "demo-user-adam",
    listingId: "demo-listing-cello",
    totalPrice: 740,
    rentalStatus: "READY_FOR_PICKUP",
  }),
  buildReservation({
    id: "demo-reservation-renter-progress",
    userId: "demo-user-adam",
    listingId: "demo-listing-flute",
    startDate: daysFromNow(-1, 14),
    endDate: daysFromNow(2, 18),
    totalPrice: 405,
    rentalStatus: "IN_PROGRESS",
    pickupConfirmedByOwner: true,
    pickupConfirmedByRenter: true,
    pickupConfirmedAt: daysFromNow(-1, 14),
  }),
  buildReservation({
    id: "demo-reservation-owner-pending",
    userId: "demo-user-nora",
    listingId: "demo-listing-violin",
    startDate: daysFromNow(10, 11),
    endDate: daysFromNow(13, 17),
    totalPrice: 450,
    rentalStatus: "PENDING",
    pickupAddress: null,
    pickupInstructions: null,
    returnAddress: null,
    returnInstructions: null,
  }),
];

export function getDemoReservationsForUser(userId = getDemoCurrentUser().id) {
  const reservations = demoReservations.filter((reservation) => reservation.userId === userId);
  return {
    reservations,
    totalCount: reservations.length,
    page: 1,
    limit: 50,
    totalPages: reservations.length > 0 ? 1 : 0,
  };
}

export function getDemoOwnerReservations(userId = getDemoCurrentUser().id) {
  const reservations = demoReservations.filter((reservation) => reservation.listing.userId === userId);
  return {
    reservations,
    pendingSetups: reservations.filter((reservation) => reservation.rentalStatus === "PENDING").length,
  };
}

export function getDemoReservations(params: DemoListingParams & { authorId?: string } = {}) {
  if (params.authorId) {
    const ownerReservations = getDemoOwnerReservations(params.authorId);
    return {
      reservations: ownerReservations.reservations,
      totalCount: ownerReservations.reservations.length,
      page: 1,
      limit: 50,
      totalPages: ownerReservations.reservations.length > 0 ? 1 : 0,
    };
  }

  const reservations = demoReservations.filter((reservation) => {
    if (params.userId && reservation.userId !== params.userId) return false;
    if (params.userId === undefined && reservation.userId !== getDemoCurrentUser().id) return false;
    if ((params as { listingId?: string }).listingId && reservation.listingId !== (params as { listingId?: string }).listingId) {
      return false;
    }
    return true;
  });

  return {
    reservations,
    totalCount: reservations.length,
    page: 1,
    limit: 50,
    totalPages: reservations.length > 0 ? 1 : 0,
  };
}

export function getDemoReservationById(reservationId?: string): (SafeReservation & { isRenter: boolean; isOwner: boolean }) | null {
  const currentUser = getDemoCurrentUser();
  let reservation = demoReservations.find((item) => item.id === reservationId);

  if (!reservation && reservationId?.startsWith("demo-reservation-checkout-")) {
    const listingId = reservationId.replace("demo-reservation-checkout-", "");
    const listing = getDemoListingById(listingId);

    if (listing) {
      reservation = buildReservation({
        id: reservationId,
        userId: currentUser.id,
        listingId,
        totalPrice: listing.price * 4,
        stripeSessionId: `demo-checkout-${listingId}`,
        rentalStatus: "READY_FOR_PICKUP",
      });
    }
  }

  if (!reservation) return null;

  return {
    ...reservation,
    isRenter: reservation.userId === currentUser.id,
    isOwner: reservation.listing.userId === currentUser.id,
  };
}

export function getDemoPaymentStatus(sessionId: string) {
  const checkoutListingId = sessionId.startsWith("demo-checkout-")
    ? sessionId.replace("demo-checkout-", "")
    : null;
  const checkoutListing = checkoutListingId ? getDemoListingById(checkoutListingId) : null;
  const reservation = checkoutListingId && checkoutListing
    ? buildReservation({
        id: `demo-reservation-checkout-${checkoutListingId}`,
        userId: getDemoCurrentUser().id,
        listingId: checkoutListingId,
        stripeSessionId: sessionId,
        rentalStatus: "READY_FOR_PICKUP",
      })
    : demoReservations.find((item) => item.stripeSessionId === sessionId) || demoReservations[0];

  return {
    payment: {
      id: "demo-payment-succeeded",
      status: "SUCCEEDED",
      amount: reservation.totalPrice * 100,
      createdAt,
    },
    reservation: {
      id: reservation.id,
      createdAt: reservation.createdAt,
    },
  };
}

export const demoConversations: DemoConversation[] = [
  {
    id: "demo-conversation-cello",
    listingId: "demo-listing-cello",
    ownerId: "demo-user-maya",
    renterId: "demo-user-adam",
    listing: {
      id: "demo-listing-cello",
      title: "German Workshop Cello for Recitals",
      imageSrc: demoListings[0].imageSrc[0],
    },
    owner: {
      id: "demo-user-maya",
      name: "Maya Chen",
      image: avatar,
    },
    renter: {
      id: "demo-user-adam",
      name: "Adam Lin",
      image: avatar,
    },
    messages: [
      {
        id: "demo-message-1",
        conversationId: "demo-conversation-cello",
        senderId: "demo-user-maya",
        content: "The cello is available for your recital dates. I can include the French bow if you prefer.",
        createdAt: daysFromNow(-2, 9),
        sender: {
          id: "demo-user-maya",
          name: "Maya Chen",
          image: avatar,
        },
      },
      {
        id: "demo-message-2",
        conversationId: "demo-conversation-cello",
        senderId: "demo-user-adam",
        content: "That would be perfect. I will bring my own endpin anchor and check the setup at pickup.",
        createdAt: daysFromNow(-2, 10),
        sender: {
          id: "demo-user-adam",
          name: "Adam Lin",
          image: avatar,
        },
      },
    ],
  },
  {
    id: "demo-conversation-violin",
    listingId: "demo-listing-violin",
    ownerId: "demo-user-adam",
    renterId: "demo-user-nora",
    listing: {
      id: "demo-listing-violin",
      title: "19th-Century Strad Copy Violin",
      imageSrc: demoListings[1].imageSrc[0],
    },
    owner: {
      id: "demo-user-adam",
      name: "Adam Lin",
      image: avatar,
    },
    renter: {
      id: "demo-user-nora",
      name: "Nora Valdez",
      image: avatar,
    },
    messages: [
      {
        id: "demo-message-3",
        conversationId: "demo-conversation-violin",
        senderId: "demo-user-nora",
        content: "Would the violin be available for a rehearsal and Sunday performance?",
        createdAt: daysFromNow(-1, 13),
        sender: {
          id: "demo-user-nora",
          name: "Nora Valdez",
          image: avatar,
        },
      },
    ],
  },
];

export function getDemoConversations() {
  return {
    conversations: demoConversations,
    totalCount: demoConversations.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  };
}

export function getDemoConversation(conversationId: string) {
  return demoConversations.find((conversation) => conversation.id === conversationId) || demoConversations[0];
}

export function createDemoMessage(conversationId: string, content: string) {
  const currentUser = getDemoCurrentUser();
  return {
    id: `demo-message-${Date.now()}`,
    conversationId,
    senderId: currentUser.id,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    sender: {
      id: currentUser.id,
      name: currentUser.name,
      image: currentUser.image,
    },
  };
}
