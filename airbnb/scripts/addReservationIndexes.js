const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addReservationIndexes() {
  console.log('Adding indexes for reservation conflict checking...');
  
  try {
    // Create compound index on listingId and status for efficient conflict checking
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reservation_listing_status 
      ON "Reservation" ("listingId", "status")
    `;
    console.log('✓ Created index on listingId and status');

    // Create index on status and dates for finding active/pending reservations
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reservation_status_dates 
      ON "Reservation" ("status", "startDate", "endDate")
    `;
    console.log('✓ Created index on status and dates');

    // Create index on stripeSessionId for webhook processing
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reservation_stripe_session 
      ON "Reservation" ("stripeSessionId")
    `;
    console.log('✓ Created index on stripeSessionId');

    // Create index on expiresAt for finding expired pending reservations
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reservation_expires 
      ON "Reservation" ("expiresAt", "status")
    `;
    console.log('✓ Created index on expiresAt');

    console.log('\nAll indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Note: MongoDB doesn't support traditional SQL indexes
// This script is for reference if migrating to PostgreSQL
console.log('Note: This script is designed for SQL databases.');
console.log('MongoDB automatically creates indexes based on query patterns.');
console.log('For MongoDB, consider using the following in MongoDB shell:');
console.log(`
db.Reservation.createIndex({ listingId: 1, status: 1 })
db.Reservation.createIndex({ status: 1, startDate: 1, endDate: 1 })
db.Reservation.createIndex({ stripeSessionId: 1 })
db.Reservation.createIndex({ expiresAt: 1, status: 1 })
`);

addReservationIndexes();