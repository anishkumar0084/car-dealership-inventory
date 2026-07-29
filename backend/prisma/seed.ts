import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing seed data to ensure idempotency
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@dealership.com', 'user@dealership.com'],
      },
    },
  });

  // For vehicles, let's clean up existing data to give a fresh start
  await prisma.vehicle.deleteMany({});

  console.log('🧹 Cleaned up old seed data.');

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // 3. Create Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@dealership.com',
      password: adminPasswordHash,
      role: 'admin',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@dealership.com',
      password: userPasswordHash,
      role: 'user',
    },
  });

  console.log('👤 Seeded users:');
  console.log(`   - Admin: ${admin.email} (password: admin123)`);
  console.log(`   - User:  ${user.email} (password: user123)`);

  // 4. Create Sample Vehicles
  const sampleVehicles = [
    {
      make: 'Tesla',
      model: 'Model Y',
      category: 'Electric',
      price: 47990,
      quantity: 5,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      price: 32500,
      quantity: 8,
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Truck',
      price: 55000,
      quantity: 3,
    },
    {
      make: 'Honda',
      model: 'Civic Sedan',
      category: 'Sedan',
      price: 23950,
      quantity: 12,
    },
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Sport',
      price: 114000,
      quantity: 2,
    },
    {
      make: 'Chevrolet',
      model: 'Bolt EV',
      category: 'Electric',
      price: 26500,
      quantity: 0, // Seed one out-of-stock vehicle to test UI behavior
    },
  ];

  for (const vehicle of sampleVehicles) {
    await prisma.vehicle.create({
      data: vehicle,
    });
  }

  console.log(`🚗 Seeded ${sampleVehicles.length} sample vehicles.`);
  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
