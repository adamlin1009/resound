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
    }),
    prisma.user.create({
      data: {
        email: 'alex.jazz@email.com',
        name: 'Alex Jazz',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria.woodwinds@email.com',
        name: 'Maria Woodwinds',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.brass@email.com',
        name: 'David Brass',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
      }
    }),
    prisma.user.create({
      data: {
        email: 'lisa.percussion@email.com',
        name: 'Lisa Percussion',
        hashedPassword,
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
      }
    })
  ]);

  // Create 35 comprehensive US-based instrument listings
  const listings = [
    // Violins (5 listings)
    {
      title: "Professional Stradivarius Copy Violin",
      description: "Beautiful 19th century Stradivarius copy in excellent condition. Perfect for advanced students and professionals. Comes with bow and case. Rich, warm tone with excellent projection.",
      imageSrc: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800",
      category: "Violin",
      conditionRating: 9,
      experienceLevel: 4,
      city: "New York",
      state: "NY",
      zipCode: "10001",
      exactAddress: "123 Carnegie Hall Way, New York, NY 10001",
      price: 150,
      userId: users[0].id
    },
    {
      title: "Student Violin - Great for Beginners",
      description: "Well-maintained student violin, perfect for those just starting their musical journey. Includes shoulder rest, rosin, and hard case. Recently serviced with new strings.",
      imageSrc: "https://images.unsplash.com/photo-1460036521480-ff49c08c2781?w=800",
      category: "Violin",
      conditionRating: 7,
      experienceLevel: 1,exactAddress: "Sample Address, ,  ", 35,
      userId: users[1].id
    },
    {
      title: "Antique German Violin 1920s",
      description: "Rare antique German violin from the 1920s. Exceptional craftsmanship with beautiful flame maple back. Perfect for chamber music and solo performances.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Violin",
      conditionRating: 8,
      experienceLevel: 5,exactAddress: "Sample Address, ,  ", 200,
      userId: users[3].id
    },
    {
      title: "Electric Violin - Modern Performance",
      description: "Contemporary electric violin perfect for rock, jazz, and experimental music. Built-in pickup system with volume and tone controls. Includes bow and cable.",
      imageSrc: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800",
      category: "Violin",
      conditionRating: 9,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 85,
      userId: users[4].id
    },
    {
      title: "Workshop Violin - Intermediate Level",
      description: "Quality workshop violin ideal for intermediate students. Good projection and tone quality. Recently had professional setup with new bridge and soundpost adjustment.",
      imageSrc: "https://images.unsplash.com/photo-1519635618540-9b1d5a4677c1?w=800",
      category: "Violin",
      conditionRating: 7,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 65,
      userId: users[0].id
    },

    // Pianos (6 listings)
    {
      title: "Yamaha C3 Grand Piano",
      description: "Stunning Yamaha C3 grand piano available for rent. 6'1\" size perfect for recitals and recordings. Regularly tuned and maintained. Delivery and setup included.",
      imageSrc: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800",
      category: "Piano",
      conditionRating: 10,
      experienceLevel: 5,exactAddress: "Sample Address, ,  ", 300,
      userId: users[2].id
    },
    {
      title: "Kawai Upright Piano - Apartment Friendly",
      description: "Beautiful Kawai upright piano with a warm, balanced tone. Perfect for apartments or smaller spaces. Recently tuned. Bench included.",
      imageSrc: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800",
      category: "Piano",
      conditionRating: 8,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 120,
      userId: users[3].id
    },
    {
      title: "Steinway Model M Grand Piano",
      description: "Iconic Steinway Model M grand piano (5'7\"). Concert-quality instrument with incredible dynamic range. Professional tuning and maintenance. Perfect for serious performances.",
      imageSrc: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
      category: "Piano",
      conditionRating: 10,
      experienceLevel: 5,exactAddress: "Sample Address, ,  ", 450,
      userId: users[2].id
    },
    {
      title: "Baldwin Baby Grand Piano",
      description: "Classic Baldwin baby grand piano with rich, warm tone. Great for jazz, classical, and contemporary music. Recently refurbished with new strings and hammers.",
      imageSrc: "https://images.unsplash.com/photo-1571974599782-87624638275b?w=800",
      category: "Piano",
      conditionRating: 8,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 275,
      userId: users[5].id
    },
    {
      title: "Yamaha P-125 Digital Piano",
      description: "Professional digital piano with weighted keys and authentic piano sound. Perfect for students and professionals who need portability. Includes sustain pedal and stand.",
      imageSrc: "https://images.unsplash.com/photo-1571974599782-87624638275b?w=800",
      category: "Piano",
      conditionRating: 9,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 75,
      userId: users[1].id
    },
    {
      title: "Vintage Wurlitzer Electric Piano",
      description: "Classic Wurlitzer 200A electric piano from the 1970s. Iconic sound used by artists like Ray Charles and Supertramp. Recently serviced with new reeds.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Piano",
      conditionRating: 7,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 95,
      userId: users[4].id
    },

    // Guitars (8 listings)
    {
      title: "Martin D-28 Acoustic Guitar",
      description: "Legendary Martin D-28 dreadnought guitar. The choice of professionals worldwide. Incredible bass response and crisp highs. Comes with deluxe hard case.",
      imageSrc: "https://images.unsplash.com/photo-1558098329-a11cff621064?w=800",
      category: "Guitar",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 125,
      userId: users[0].id
    },
    {
      title: "Fender Stratocaster Electric Guitar",
      description: "Classic American Fender Stratocaster in sunburst finish. Versatile tone suitable for any genre. Includes amp and cable for complete setup.",
      imageSrc: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800",
      category: "Guitar",
      conditionRating: 8,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 85,
      userId: users[1].id
    },
    {
      title: "Gibson Les Paul Standard",
      description: "Iconic Gibson Les Paul Standard with classic humbucker tone. Perfect for rock, blues, and jazz. Beautiful tobacco sunburst finish. Recently set up with new strings.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Guitar",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 135,
      userId: users[6].id
    },
    {
      title: "Taylor 814ce Acoustic-Electric",
      description: "Premium Taylor 814ce with Grand Auditorium body and built-in electronics. Perfect for recording and live performance. Includes Taylor hard case.",
      imageSrc: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800",
      category: "Guitar",
      conditionRating: 10,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 165,
      userId: users[2].id
    },
    {
      title: "Fender Jazz Bass Guitar",
      description: "Classic Fender Jazz Bass with versatile tone controls. Great for jazz, rock, funk, and R&B. Active electronics with 9V battery. Includes gig bag and cable.",
      imageSrc: "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=800",
      category: "Guitar",
      conditionRating: 8,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 95,
      userId: users[4].id
    },
    {
      title: "Classical Guitar - Concert Quality",
      description: "Handcrafted classical guitar with cedar top and rosewood back. Perfect intonation and balance. Ideal for classical, flamenco, and fingerstyle playing.",
      imageSrc: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800",
      category: "Guitar",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 115,
      userId: users[3].id
    },
    {
      title: "Beginner Acoustic Guitar Package",
      description: "Complete beginner package with acoustic guitar, picks, strap, tuner, and instructional book. Perfect for those just starting their musical journey.",
      imageSrc: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800",
      category: "Guitar",
      conditionRating: 8,
      experienceLevel: 1,exactAddress: "Sample Address, ,  ", 35,
      userId: users[1].id
    },
    {
      title: "Vintage Gibson J-45 Acoustic",
      description: "Rare vintage Gibson J-45 from 1960s. Incredible aging and tone development. A piece of music history. Professional setup and maintenance.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Guitar",
      conditionRating: 8,
      experienceLevel: 5,exactAddress: "Sample Address, ,  ", 225,
      userId: users[5].id
    },

    // Saxophones (4 listings)
    {
      title: "Selmer Mark VI Alto Saxophone",
      description: "The holy grail of saxophones - vintage Selmer Mark VI. Recently overhauled. Includes mouthpiece and reeds. Perfect intonation and legendary tone.",
      imageSrc: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800",
      category: "Saxophone",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 175,
      userId: users[3].id
    },
    {
      title: "Yamaha YAS-480 Intermediate Alto Sax",
      description: "Professional intermediate alto saxophone perfect for advancing students. Excellent build quality and intonation. Recently serviced with new pads.",
      imageSrc: "https://images.unsplash.com/photo-1551127481-43279ba57543?w=800",
      category: "Saxophone",
      conditionRating: 8,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 95,
      userId: users[5].id
    },
    {
      title: "Tenor Saxophone - Professional Model",
      description: "Professional tenor saxophone with rich, powerful sound. Perfect for jazz ensembles and solo work. Includes case, mouthpiece, and cleaning kit.",
      imageSrc: "https://images.unsplash.com/photo-1551127481-43279ba57543?w=800",
      category: "Saxophone",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 155,
      userId: users[4].id
    },
    {
      title: "Student Alto Saxophone",
      description: "Quality student alto saxophone perfect for beginners. Easy playing action and good intonation. Includes everything needed to start playing.",
      imageSrc: "https://images.unsplash.com/photo-1520637736862-4d197d17c86a?w=800",
      category: "Saxophone",
      conditionRating: 7,
      experienceLevel: 1,exactAddress: "Sample Address, ,  ", 65,
      userId: users[6].id
    },

    // Trumpets (3 listings)
    {
      title: "Bach Stradivarius Trumpet",
      description: "Professional Bach Stradivarius trumpet with incredible projection and tone. The choice of orchestral and jazz professionals worldwide. Recently serviced.",
      imageSrc: "https://images.unsplash.com/photo-1558369178-9e3a64b4dc4d?w=800",
      category: "Trumpet",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 125,
      userId: users[6].id
    },
    {
      title: "Student Trumpet - Beginner Friendly",
      description: "Well-maintained student trumpet perfect for school band and lessons. Easy playing action and good intonation. Includes case and mouthpiece.",
      imageSrc: "https://images.unsplash.com/photo-1558369178-9e3a64b4dc4d?w=800",
      category: "Trumpet",
      conditionRating: 8,
      experienceLevel: 1,exactAddress: "Sample Address, ,  ", 45,
      userId: users[7].id
    },
    {
      title: "Yamaha Professional Trumpet",
      description: "Yamaha professional trumpet with excellent build quality and reliability. Perfect for classical and jazz performance. Gold brass bell for warm tone.",
      imageSrc: "https://images.unsplash.com/photo-1558369178-9e3a64b4dc4d?w=800",
      category: "Trumpet",
      conditionRating: 8,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 85,
      userId: users[0].id
    },

    // Flutes (2 listings)
    {
      title: "Powell Professional Flute",
      description: "Handcrafted Powell flute with silver-plated head joint. Exceptional response and tone quality. Perfect for orchestral and chamber music.",
      imageSrc: "https://images.unsplash.com/photo-1517810362723-b5e99b2b79a5?w=800",
      category: "Flute",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 135,
      userId: users[5].id
    },
    {
      title: "Student Flute - Great for Beginners",
      description: "Quality student flute with closed holes and plateau keys. Easy to play and maintain. Perfect for band students and beginners. Recently serviced.",
      imageSrc: "https://images.unsplash.com/photo-1517810362723-b5e99b2b79a5?w=800",
      category: "Flute",
      conditionRating: 8,
      experienceLevel: 1,exactAddress: "Sample Address, ,  ", 55,
      userId: users[1].id
    },

    // Clarinets (2 listings)
    {
      title: "Buffet R13 Professional Clarinet",
      description: "World-renowned Buffet R13 clarinet used by professionals globally. Rich, warm tone with excellent projection. Grenadilla wood construction.",
      imageSrc: "https://images.unsplash.com/photo-1551127481-43279ba57543?w=800",
      category: "Clarinet",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 145,
      userId: users[5].id
    },
    {
      title: "Intermediate Clarinet - Wood Body",
      description: "Intermediate clarinet with wood body for advanced students. Great tone quality and smooth key action. Includes case, mouthpiece, and reeds.",
      imageSrc: "https://images.unsplash.com/photo-1551127481-43279ba57543?w=800",
      category: "Clarinet",
      conditionRating: 8,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 75,
      userId: users[2].id
    },

    // Drums (3 listings)
    {
      title: "Pearl Export Series Drum Kit",
      description: "Complete Pearl Export 5-piece drum kit with cymbals and hardware. Perfect for rock, pop, and jazz. Recently tuned with new heads.",
      imageSrc: "https://images.unsplash.com/photo-1571327073757-95991d7ce7e1?w=800",
      category: "Drums",
      conditionRating: 8,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 185,
      userId: users[7].id
    },
    {
      title: "Professional Snare Drum - Ludwig",
      description: "Ludwig Supraphonic snare drum with classic bright, cutting tone. Perfect for recording and live performance. Includes stand and sticks.",
      imageSrc: "https://images.unsplash.com/photo-1571327073757-95991d7ce7e1?w=800",
      category: "Drums",
      conditionRating: 9,
      experienceLevel: 3,exactAddress: "Sample Address, ,  ", 65,
      userId: users[3].id
    },
    {
      title: "Electronic Drum Kit - Roland",
      description: "Roland electronic drum kit perfect for practice and recording. Mesh heads for realistic feel. Includes module with hundreds of sounds and songs.",
      imageSrc: "https://images.unsplash.com/photo-1571327073757-95991d7ce7e1?w=800",
      category: "Drums",
      conditionRating: 9,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 125,
      userId: users[4].id
    },

    // Cello (2 listings)
    {
      title: "Professional Cello - German Workshop",
      description: "Beautiful German workshop cello with rich, deep tone. Perfect for orchestral and chamber music. Includes bow, case, and rosin. Recently set up.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Cello",
      conditionRating: 9,
      experienceLevel: 4,exactAddress: "Sample Address, ,  ", 185,
      userId: users[0].id
    },
    {
      title: "Student Cello - 4/4 Size",
      description: "Quality student cello perfect for intermediate players. Good projection and comfortable playability. Includes fiberglass bow and soft case.",
      imageSrc: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "Cello",
      conditionRating: 7,
      experienceLevel: 2,exactAddress: "Sample Address, ,  ", 95,
      userId: users[1].id
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
    },
    {
      userId: users[3].id,
      listingId: createdListings[5].id, // Piano rental
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      totalPrice: 2100
    },
    {
      userId: users[4].id,
      listingId: createdListings[12].id, // Guitar rental
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      totalPrice: 340
    }
  ];

  await Promise.all(
    reservations.map(reservation => prisma.reservation.create({ data: reservation }))
  );

  console.log('✅ Mock data seeded successfully!');
  console.log(`Created ${users.length} users`);
  console.log(`Created ${createdListings.length} instrument listings across the United States`);
  console.log(`Created ${reservations.length} sample reservations`);
  console.log('\n📧 Test accounts:');
  console.log('Email: john.musician@email.com | Password: password123');
  console.log('Email: sarah.strings@email.com | Password: password123');
  console.log('Email: mike.piano@email.com | Password: password123');
  console.log('Email: emma.classical@email.com | Password: password123');
  console.log('\n🏙️ Listings span major US cities including:');
  console.log('New York, Los Angeles, Chicago, Miami, Boston, Seattle, Austin, Denver, and more...');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });