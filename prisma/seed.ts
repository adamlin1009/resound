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
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.strings@email.com',
        name: 'Sarah Strings',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.piano@email.com',
        name: 'Mike Piano',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'emma.classical@email.com',
        name: 'Emma Classical',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'alex.jazz@email.com',
        name: 'Alex Jazz',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria.woodwinds@email.com',
        name: 'Maria Woodwinds',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.brass@email.com',
        name: 'David Brass',
        hashedPassword,
        image: null
      }
    }),
    prisma.user.create({
      data: {
        email: 'lisa.percussion@email.com',
        name: 'Lisa Percussion',
        hashedPassword,
        image: null
      }
    })
  ]);

  // Create comprehensive US-based instrument listings
  // Using placeholder images that will work
  const listings = [
    // Strings - Violins
    {
      title: "Professional Stradivarius Copy Violin",
      description: "Beautiful 19th century Stradivarius copy in excellent condition. Perfect for advanced students and professionals. Comes with bow and case. Rich, warm tone with excellent projection.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/strad_copy.webp",
      category: "Strings",
      
      experienceLevel: 4,
      city: "New York",
      state: "NY",
      zipCode: "10001",
      exactAddress: "123 Carnegie Hall Way, New York, NY 10001",
      latitude: 40.7648,
      longitude: -73.9808,
      price: 150,
      userId: users[0].id
    },
    {
      title: "Student Violin - Great for Beginners",
      description: "Well-maintained student violin, perfect for those just starting their musical journey. Includes shoulder rest, rosin, and hard case. Recently serviced with new strings.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/student_violin.webp",
      category: "Strings",
      
      experienceLevel: 1,
      city: "Los Angeles",
      state: "CA", 
      zipCode: "90210",
      exactAddress: "456 Music Ave, Los Angeles, CA 90210",
      latitude: 34.0901,
      longitude: -118.4065,
      price: 35,
      userId: users[1].id
    },
    {
      title: "Electric Violin - Modern Performance",
      description: "Contemporary electric violin perfect for rock, jazz, and experimental music. Built-in pickup system with volume and tone controls. Includes bow and cable.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/YEV_electric_violin.jpg",
      category: "Strings",
      
      experienceLevel: 3,
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      exactAddress: "789 Electric Ave, Chicago, IL 60601",
      latitude: 41.8781,
      longitude: -87.6298,
      price: 85,
      userId: users[4].id
    },

    // Strings - Guitars
    {
      title: "Martin D-28 Acoustic Guitar",
      description: "Legendary Martin D-28 dreadnought guitar. The choice of professionals worldwide. Incredible bass response and crisp highs. Comes with deluxe hard case.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/martin_d28.webp",
      category: "Strings",
      
      experienceLevel: 4,
      city: "Philadelphia",
      state: "PA",
      zipCode: "19101",
      exactAddress: "147 Martin Rd, Philadelphia, PA 19101",
      latitude: 39.9526,
      longitude: -75.1652,
      price: 125,
      userId: users[0].id
    },
    {
      title: "Fender Stratocaster Electric Guitar",
      description: "Classic American Fender Stratocaster in sunburst finish. Versatile tone suitable for any genre. Includes amp and cable for complete setup.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/fender_strato.jpg",
      category: "Strings",
      
      experienceLevel: 3,
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      exactAddress: "258 Fender Ave, Phoenix, AZ 85001",
      latitude: 33.4484,
      longitude: -112.074,
      price: 85,
      userId: users[1].id
    },
    {
      title: "Classical Guitar - Concert Quality",
      description: "Handcrafted classical guitar with cedar top and rosewood back. Perfect intonation and balance. Ideal for classical, flamenco, and fingerstyle playing.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/classical_guiatr.jpeg",
      category: "Strings",
      
      experienceLevel: 4,
      city: "Charlotte",
      state: "NC",
      zipCode: "28201",
      exactAddress: "963 Classical Way, Charlotte, NC 28201",
      latitude: 35.2271,
      longitude: -80.8431,
      price: 115,
      userId: users[3].id
    },

    // Strings - Cello
    {
      title: "Professional Cello - German Workshop",
      description: "Beautiful German workshop cello with rich, deep tone. Perfect for orchestral and chamber music. Includes bow, case, and rosin. Recently set up.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/cello.webp",
      category: "Strings",
      
      experienceLevel: 4,
      city: "Nashville",
      state: "TN",
      zipCode: "37201",
      exactAddress: "123 Music St, Nashville, TN 37201",
      latitude: 36.1627,
      longitude: -86.7816,
      price: 185,
      userId: users[0].id
    },
    {
      title: "Student Cello - 4/4 Size",
      description: "Quality student cello perfect for intermediate players. Good projection and comfortable playability. Includes fiberglass bow and soft case.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/student-cello.jpg",
      category: "Strings",
      
      experienceLevel: 2,
      city: "Atlanta",
      state: "GA",
      zipCode: "30301",
      exactAddress: "123 Music St, Atlanta, GA 30301",
      latitude: 33.749,
      longitude: -84.388,
      price: 95,
      userId: users[1].id
    },

    // Strings - Bass
    {
      title: "Fender Jazz Bass Guitar",
      description: "Classic Fender Jazz Bass with versatile tone controls. Great for jazz, rock, funk, and R&B. Active electronics with 9V battery. Includes gig bag and cable.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/fender_jazz_bass.webp",
      category: "Strings",
      
      experienceLevel: 3,
      city: "Las Vegas",
      state: "NV",
      zipCode: "89101",
      exactAddress: "852 Jazz Bass Dr, Las Vegas, NV 89101",
      latitude: 36.1699,
      longitude: -115.1398,
      price: 95,
      userId: users[4].id
    },
    {
      title: "Double Bass - Orchestral Quality",
      description: "Full-size orchestral double bass with powerful, deep tone. Perfect for symphony orchestra and jazz ensemble work. Includes German bow and padded cover.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/double_bass.jpg",
      category: "Strings",
      
      experienceLevel: 4,
      city: "Boston",
      state: "MA",
      zipCode: "02110",
      exactAddress: "200 Symphony Hall Ave, Boston, MA 02110",
      latitude: 42.3601,
      longitude: -71.0589,
      price: 300,
      userId: users[6].id
    },

    // Keyboards - Pianos
    {
      title: "Yamaha C3 Grand Piano",
      description: "Stunning Yamaha C3 grand piano available for rent. 6'1\" size perfect for recitals and recordings. Regularly tuned and maintained. Delivery and setup included.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/c3_yamaha.webp",
      category: "Keyboards",
      
      experienceLevel: 5,
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      exactAddress: "123 Grand Piano Blvd, San Francisco, CA 94102",
      latitude: 37.7749,
      longitude: -122.4194,
      price: 300,
      userId: users[2].id
    },
    {
      title: "Kawai Upright Piano - Apartment Friendly",
      description: "Beautiful Kawai upright piano with a warm, balanced tone. Perfect for apartments or smaller spaces. Recently tuned. Bench included.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/kawai_upright.jpg",
      category: "Keyboards",
      
      experienceLevel: 3,
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      exactAddress: "456 Upright Ave, Seattle, WA 98101",
      latitude: 47.6062,
      longitude: -122.3321,
      price: 120,
      userId: users[3].id
    },
    {
      title: "Steinway Model M Grand Piano",
      description: "Iconic Steinway Model M grand piano (5'7\"). Concert-quality instrument with incredible dynamic range. Professional tuning and maintenance. Perfect for serious performances.",
      imageSrc: "",
      category: "Keyboards",
      
      experienceLevel: 5,
      city: "Austin",
      state: "TX",
      zipCode: "73301",
      exactAddress: "789 Steinway Dr, Austin, TX 73301",
      latitude: 30.2672,
      longitude: -97.7431,
      price: 450,
      userId: users[2].id
    },
    {
      title: "Yamaha P-125 Digital Piano",
      description: "Professional digital piano with weighted keys and authentic piano sound. Perfect for students and professionals who need portability. Includes sustain pedal and stand.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/yamaha_p125.jpg",
      category: "Keyboards",
      
      experienceLevel: 2,
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      exactAddress: "654 Digital St, Portland, OR 97201",
      latitude: 45.5152,
      longitude: -122.6784,
      price: 75,
      userId: users[1].id
    },

    // Woodwinds - Saxophones
    {
      title: "Selmer Mark VI Alto Saxophone",
      description: "The holy grail of saxophones - vintage Selmer Mark VI. Recently overhauled. Includes mouthpiece and reeds. Perfect intonation and legendary tone.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/semler_mark6.webp",
      category: "Woodwinds",
      
      experienceLevel: 4,
      city: "New Orleans",
      state: "LA",
      zipCode: "70112",
      exactAddress: "468 Selmer St, New Orleans, LA 70112",
      latitude: 29.9511,
      longitude: -90.0715,
      price: 175,
      userId: users[3].id
    },
    {
      title: "Tenor Saxophone - Professional Model",
      description: "Professional tenor saxophone with rich, powerful sound. Perfect for jazz ensembles and solo work. Includes case, mouthpiece, and cleaning kit.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/tenor_sax.webp",
      category: "Woodwinds",
      
      experienceLevel: 4,
      city: "Kansas City",
      state: "MO",
      zipCode: "64101",
      exactAddress: "680 Tenor Ave, Kansas City, MO 64101",
      latitude: 39.0997,
      longitude: -94.5786,
      price: 155,
      userId: users[4].id
    },

    // Woodwinds - Flutes
    {
      title: "Powell Professional Flute",
      description: "Handcrafted Powell flute with silver-plated head joint. Exceptional response and tone quality. Perfect for orchestral and chamber music.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/powell_flute.webp",
      category: "Woodwinds",
      
      experienceLevel: 4,
      city: "Milwaukee",
      state: "WI",
      zipCode: "53201",
      exactAddress: "235 Powell St, Milwaukee, WI 53201",
      latitude: 43.0389,
      longitude: -87.9065,
      price: 135,
      userId: users[5].id
    },
    {
      title: "Student Flute - Great for Beginners",
      description: "Quality student flute with closed holes and plateau keys. Easy to play and maintain. Perfect for band students and beginners. Recently serviced.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/flute.webp",
      category: "Woodwinds",
      
      experienceLevel: 1,
      city: "Oklahoma City",
      state: "OK",
      zipCode: "73101",
      exactAddress: "346 Flute Ave, Oklahoma City, OK 73101",
      latitude: 35.4676,
      longitude: -97.5164,
      price: 55,
      userId: users[1].id
    },

    // Woodwinds - Clarinets
    {
      title: "Buffet R13 Professional Clarinet",
      description: "World-renowned Buffet R13 clarinet used by professionals globally. Rich, warm tone with excellent projection. Grenadilla wood construction.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/R13_clarinet.webp",
      category: "Woodwinds",
      
      experienceLevel: 4,
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      exactAddress: "123 Music St, San Francisco, CA 94102",
      latitude: 37.7749,
      longitude: -122.4194,
      price: 145,
      userId: users[5].id
    },

    // Brass - Trumpets
    {
      title: "Bach Stradivarius Trumpet",
      description: "Professional Bach Stradivarius trumpet with incredible projection and tone. The choice of orchestral and jazz professionals worldwide. Recently serviced.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/bach_strad.webp",
      category: "Brass",
      
      experienceLevel: 4,
      city: "Salt Lake City",
      state: "UT",
      zipCode: "84101",
      exactAddress: "802 Bach Blvd, Salt Lake City, UT 84101",
      latitude: 40.7608,
      longitude: -111.891,
      price: 125,
      userId: users[6].id
    },
    {
      title: "Student Trumpet - Beginner Friendly",
      description: "Well-maintained student trumpet perfect for school band and lessons. Easy playing action and good intonation. Includes case and mouthpiece.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/beg_trumpet.jpeg",
      category: "Brass",
      
      experienceLevel: 1,
      city: "Richmond",
      state: "VA",
      zipCode: "23218",
      exactAddress: "913 Trumpet Ln, Richmond, VA 23218",
      latitude: 37.5407,
      longitude: -77.436,
      price: 45,
      userId: users[7].id
    },
    {
      title: "Yamaha Professional Trumpet",
      description: "Yamaha professional trumpet with excellent build quality and reliability. Perfect for classical and jazz performance. Gold brass bell for warm tone.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/yamaha_pro_trumpet.webp",
      category: "Brass",
      
      experienceLevel: 3,
      city: "Sacramento",
      state: "CA",
      zipCode: "95814",
      exactAddress: "124 Professional Dr, Sacramento, CA 95814",
      latitude: 38.5816,
      longitude: -121.4944,
      price: 85,
      userId: users[0].id
    },

    // Percussion - Drums
    {
      title: "Pearl Export Series Drum Kit",
      description: "Complete Pearl Export 5-piece drum kit with cymbals and hardware. Perfect for rock, pop, and jazz. Recently tuned with new heads.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/pearl_drums_new.webp",
      category: "Percussion",
      
      experienceLevel: 2,
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      exactAddress: "123 Music St, Seattle, WA 98101",
      latitude: 47.6062,
      longitude: -122.3321,
      price: 185,
      userId: users[7].id
    },
    {
      title: "Professional Snare Drum - Ludwig",
      description: "Ludwig Supraphonic snare drum with classic bright, cutting tone. Perfect for recording and live performance. Includes stand and sticks.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/ludwig.jpg",
      category: "Percussion",
      
      experienceLevel: 3,
      city: "Denver",
      state: "CO",
      zipCode: "80201",
      exactAddress: "123 Music St, Denver, CO 80201",
      latitude: 39.7392,
      longitude: -104.9903,
      price: 65,
      userId: users[3].id
    },
    {
      title: "Electronic Drum Kit - Roland",
      description: "Roland electronic drum kit perfect for practice and recording. Mesh heads for realistic feel. Includes module with hundreds of sounds and songs.",
      imageSrc: "https://resound-test-images.s3.us-east-2.amazonaws.com/resound-images/roland_drum_kit.jpg",
      category: "Percussion",
      
      experienceLevel: 2,
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      exactAddress: "123 Music St, Austin, TX 78701",
      latitude: 30.2672,
      longitude: -97.7431,
      price: 125,
      userId: users[4].id
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
      listingId: createdListings[10].id, // Piano rental
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      totalPrice: 2100
    },
    {
      userId: users[4].id,
      listingId: createdListings[3].id, // Guitar rental
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      totalPrice: 500
    }
  ];

  await Promise.all(
    reservations.map(reservation => prisma.reservation.create({ data: reservation }))
  );

}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });