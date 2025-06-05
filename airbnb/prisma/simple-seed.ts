import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      hashedPassword: 'hashedpassword123',
    }
  });

  // Create a simple test listing
  await prisma.listing.create({
    data: {
      title: "Test Violin",
      description: "A test violin for development",
      imageSrc: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800",
      category: "Violin",
      conditionRating: 8,
      experienceLevel: 3,
      city: "Irvine",
      state: "CA",
      zipCode: "92602",
      exactAddress: "123 Test Street, Irvine, CA 92602",
      price: 100,
      userId: user.id
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });