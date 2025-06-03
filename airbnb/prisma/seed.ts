import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reservation.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});

  // Create mock users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.musician@email.com',
        name: 'John Musician',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.strings@email.com',
        name: 'Sarah Strings',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.piano@email.com',
        name: 'Mike Piano',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'emma.classical@email.com',
        name: 'Emma Classical',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
      }
    })
  ]);

  // Create mock instrument listings
  const listings = [
    // Violins
    {
      title: "Professional Stradivarius Copy Violin",
      description: "Beautiful 19th century Stradivarius copy in excellent condition. Perfect for advanced students and professionals. Comes with bow and case. Rich, warm tone with excellent projection.",
      imageSrc: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800",
      category: "Violin",
      conditionRating: 9,
      experienceLevel: 4,
      locationValue: "US",
      price: 150,
      userId: users[0].id
    },
    {
      title: "Student Violin - Great for Beginners",
      description: "Well-maintained student violin, perfect for those just starting their musical journey. Includes shoulder rest, rosin, and hard case. Recently serviced with new strings.",
      imageSrc: "https://images.unsplash.com/photo-1460036521480-ff49c08c2781?w=800",
      category: "Violin",
      conditionRating: 7,
      experienceLevel: 1,
      locationValue: "US",
      price: 35,
      userId: users[1].id
    },
    
    // Pianos
    {
      title: "Yamaha C3 Grand Piano",
      description: "Stunning Yamaha C3 grand piano available for rent. 6'1\" size perfect for recitals and recordings. Regularly tuned and maintained. Delivery and setup included.",
      imageSrc: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800",
      category: "Piano",
      conditionRating: 10,
      experienceLevel: 5,
      locationValue: "GB",
      price: 300,
      userId: users[2].id
    },
    {
      title: "Kawai Upright Piano - Apartment Friendly",
      description: "Beautiful Kawai upright piano with a warm, balanced tone. Perfect for apartments or smaller spaces. Recently tuned. Bench included.",
      imageSrc: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800",
      category: "Piano",
      conditionRating: 8,
      experienceLevel: 2,
      locationValue: "CA",
      price: 120,
      userId: users[3].id
    },
    
    // Guitars
    {
      title: "Martin D-28 Acoustic Guitar",
      description: "Legendary Martin D-28 dreadnought guitar. The choice of professionals worldwide. Incredible bass response and crisp highs. Comes with deluxe hard case.",
      imageSrc: "https://images.unsplash.com/photo-1558098329-a11cff621064?w=800",
      category: "Guitar",
      conditionRating: 9,
      experienceLevel: 4,
      locationValue: "US",
      price: 125,
      userId: users[0].id
    },
    {
      title: "Fender Stratocaster Electric Guitar",
      description: "Classic American Fender Stratocaster in sunburst finish. Versatile tone suitable for any genre. Includes amp and cable for complete setup.",
      imageSrc: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800",
      category: "Guitar",
      conditionRating: 8,
      experienceLevel: 3,
      locationValue: "FR",
      price: 85,
      userId: users[1].id
    },
    
    // More instruments...
    {
      title: "Selmer Mark VI Alto Saxophone",
      description: "The holy grail of saxophones - vintage Selmer Mark VI. Recently overhauled. Includes mouthpiece and reeds. Perfect intonation and legendary tone.",
      imageSrc: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800",
      category: "Saxophone",
      conditionRating: 9,
      experienceLevel: 4,
      locationValue: "US",
      price: 175,
      userId: users[3].id
    }
  ];

  // Create all listings
  const createdListings = await Promise.all(
    listings.map(listing => prisma.listing.create({ data: listing }))
  );

  // Create some sample reservations
  const now = new Date();
  const reservations = [
    {
      userId: users[1].id,
      listingId: createdListings[0].id, // Violin rental
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      totalPrice: 450
    }
  ];

  await Promise.all(
    reservations.map(reservation => prisma.reservation.create({ data: reservation }))
  );

  console.log('✅ Mock data seeded successfully!');
  console.log(`Created ${users.length} users`);
  console.log(`Created ${createdListings.length} instrument listings`);
  console.log(`Created ${reservations.length} reservations`);
  console.log('\n📧 Test accounts:');
  console.log('Email: john.musician@email.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
