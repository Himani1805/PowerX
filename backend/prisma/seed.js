const { PrismaClient, Role, LeadStatus, ActivityType } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const prisma = new PrismaClient();

// Helper function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting database seeding...');
  
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create test users
  console.log('Creating test users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@PowerX .com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Manager One',
      email: 'manager@PowerX .com',
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  const salesReps = [];
  for (let i = 1; i <= 3; i++) {
    const salesRep = await prisma.user.create({
      data: {
        name: `Sales Rep ${i}`,
        email: `sales${i}@PowerX .com`,
        password: hashedPassword,
        role: Role.SALES,
      },
    });
    salesReps.push(salesRep);
  }

  // Create leads
  console.log('Creating test leads...');
  const statuses = Object.values(LeadStatus);
  const sources = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EVENT', 'COLD_CALL'];
  const allUsers = [admin, manager, ...salesReps];

  for (let i = 1; i <= 20; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: faker.name.findName(),
        company: faker.company.companyName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        source: faker.random.arrayElement(sources),
        status: faker.random.arrayElement(statuses),
        notes: faker.lorem.paragraph(),
        owner: {
          connect: { id: faker.random.arrayElement(allUsers).id }
        },
      },
    });

    // Create activities for each lead
    const activityCount = faker.datatype.number({ min: 1, max: 5 });
    for (let j = 0; j < activityCount; j++) {
      await prisma.activity.create({
        data: {
          type: faker.random.arrayElement(Object.values(ActivityType)),
          content: faker.lorem.sentences(2),
          lead: { connect: { id: lead.id } },
          createdBy: { connect: { id: faker.random.arrayElement(allUsers).id } },
          createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        },
      });
    }
  }

  // Create notifications
  console.log('Creating test notifications...');
  const notificationTypes = ['LEAD_ASSIGNED', 'STATUS_UPDATED', 'NEW_MESSAGE', 'SYSTEM_ALERT'];
  
  for (const user of allUsers) {
    const notificationCount = faker.datatype.number({ min: 1, max: 5 });
    for (let i = 0; i < notificationCount; i++) {
      await prisma.notification.create({
        data: {
          type: faker.random.arrayElement(notificationTypes),
          message: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(),
          user: { connect: { id: user.id } },
          createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        },
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('\n Test Accounts:');
  console.log('------------------');
  console.log(`Admin: admin@PowerX .com / password123`);
  console.log(`Manager: manager@PowerX .com / password123`);
  console.log(`Sales Reps: sales1@PowerX .com to sales3@PowerX .com / password123`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });