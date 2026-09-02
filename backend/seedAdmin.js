const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = "admin@thinkzai.com"; // Matches the email in your screenshot
    const plainPassword = "Admin@123"; 
    const name = "System Administrator";

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert user (creates if not exists, or updates role/password if it does)
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'Admin',
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'Admin',
      },
    });

    console.log("✅ Admin user successfully configured!");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Role: ${admin.role}`);
  } catch (err) {
    console.error("❌ Error setting up admin:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();