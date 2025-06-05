// Script to make a user an admin
// Usage: node scripts/makeAdmin.js <email>

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email address');
    console.error('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: { id: true, name: true, email: true, isAdmin: true }
    });

    console.log('✅ User is now an admin:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Admin: ${user.isAdmin}`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ User not found with email:', email);
    } else {
      console.error('❌ Error making user admin:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();