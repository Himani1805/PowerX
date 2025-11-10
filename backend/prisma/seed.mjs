import { PrismaClient, Role, LeadStatus, ActivityType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting database seeding...');
  
  // Clear existing data
  console.log('Clearing existing data...');
  try {
    // Delete data in the correct order to respect foreign key constraints
    await prisma.notification.deleteMany({}).catch(() => {});
    await prisma.activity.deleteMany({}).catch(() => {});
    await prisma.lead.deleteMany({}).catch(() => {});
    await prisma.user.deleteMany({}).catch(() => {});
  } catch (error) {
    console.log('Error clearing data, continuing with seed:', error.message);
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create test users
  console.log('Creating test users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@powerx.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Manager One',
      email: 'manager@powerx.com',
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  const salesReps = [];
  for (let i = 1; i <= 3; i++) {
    const salesRep = await prisma.user.create({
      data: {
        name: `Sales Rep ${i}`,
        email: `sales${i}@powerx.com`,
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
    const owner = faker.helpers.arrayElement(allUsers);
    const lead = await prisma.lead.create({
      data: {
        name: faker.person.fullName(),
        company: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        source: faker.helpers.arrayElement(sources),
        status: faker.helpers.arrayElement(statuses),
        notes: faker.lorem.paragraph(),
        owner: {
          connect: { id: owner.id }
        },
        createdBy: {
          connect: { id: owner.id }
        },
        updatedBy: {
          connect: { id: owner.id }
        },
      },
    });

    // Create activities for each lead
    const activityCount = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < activityCount; j++) {
      await prisma.activity.create({
        data: {
          type: faker.helpers.arrayElement(Object.values(ActivityType)),
          content: faker.lorem.sentences(2),
          lead: { connect: { id: lead.id } },
          createdBy: { connect: { id: faker.helpers.arrayElement(allUsers).id } },
          createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        },
      });
    }
  }

  // Create notifications
  console.log('Creating test notifications...');
  const notificationTypes = ['LEAD_ASSIGNED', 'STATUS_UPDATED', 'NEW_MESSAGE', 'SYSTEM_ALERT'];
  
  for (const user of allUsers) {
    const notificationCount = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < notificationCount; i++) {
      await prisma.notification.create({
        data: {
          type: faker.helpers.arrayElement(notificationTypes),
          message: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(),
          user: { connect: { id: user.id } },
          createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        },
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('------------------');
  console.log(`Admin: admin@powerx.com / password123`);
  console.log(`Manager: manager@powerx.com / password123`);
  console.log(`Sales Reps: sales1@powerx.com to sales3@powerx.com / password123`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });