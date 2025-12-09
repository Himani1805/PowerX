import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const leadsData = [
  { firstName: "Aarav", lastName: "Sharma", email: "aarav.sharma@example.com", phone: "+91 98765 43210", organization: "Tech Innovations", status: "NEW" },
  { firstName: "Vivaan", lastName: "Patel", email: "vivaan.patel@example.com", phone: "+91 98765 43211", organization: "Global Solutions", status: "CONTACTED" },
  { firstName: "Aditya", lastName: "Verma", email: "aditya.verma@example.com", phone: "+91 98765 43212", organization: "Verma Enterprises", status: "QUALIFIED" },
  { firstName: "Vihaan", lastName: "Reddy", email: "vihaan.reddy@example.com", phone: "+91 98765 43213", organization: "Reddy Corp", status: "LOST" },
  { firstName: "Arjun", lastName: "Nair", email: "arjun.nair@example.com", phone: "+91 98765 43214", organization: "Nair Systems", status: "WON" },
  { firstName: "Sai", lastName: "Kumar", email: "sai.kumar@example.com", phone: "+91 98765 43215", organization: "Kumar & Co", status: "NEW" },
  { firstName: "Reyansh", lastName: "Gupta", email: "reyansh.gupta@example.com", phone: "+91 98765 43216", organization: "Gupta Traders", status: "CONTACTED" },
  { firstName: "Ayaan", lastName: "Singh", email: "ayaan.singh@example.com", phone: "+91 98765 43217", organization: "Singh Logistics", status: "QUALIFIED" },
  { firstName: "Krishna", lastName: "Iyer", email: "krishna.iyer@example.com", phone: "+91 98765 43218", organization: "Iyer Consulting", status: "LOST" },
  { firstName: "Ishaan", lastName: "Joshi", email: "ishaan.joshi@example.com", phone: "+91 98765 43219", organization: "Joshi Group", status: "WON" },
  { firstName: "Shaurya", lastName: "Mehta", email: "shaurya.mehta@example.com", phone: "+91 98765 43220", organization: "Mehta Finances", status: "NEW" },
  { firstName: "Atharva", lastName: "Malhotra", email: "atharva.malhotra@example.com", phone: "+91 98765 43221", organization: "Malhotra Tech", status: "CONTACTED" },
  { firstName: "Rohan", lastName: "Bhat", email: "rohan.bhat@example.com", phone: "+91 98765 43222", organization: "Bhat Design", status: "QUALIFIED" },
  { firstName: "Dhruv", lastName: "Saxena", email: "dhruv.saxena@example.com", phone: "+91 98765 43223", organization: "Saxena Exports", status: "LOST" },
  { firstName: "Kabir", lastName: "Desai", email: "kabir.desai@example.com", phone: "+91 98765 43224", organization: "Desai Industries", status: "WON" },
  { firstName: "Anika", lastName: "Roy", email: "anika.roy@example.com", phone: "+91 98765 43225", organization: "Roy Media", status: "NEW" },
  { firstName: "Diya", lastName: "Chopra", email: "diya.chopra@example.com", phone: "+91 98765 43226", organization: "Chopra Retail", status: "CONTACTED" },
  { firstName: "Myra", lastName: "Kapoor", email: "myra.kapoor@example.com", phone: "+91 98765 43227", organization: "Kapoor Services", status: "QUALIFIED" },
  { firstName: "Saanvi", lastName: "Jain", email: "saanvi.jain@example.com", phone: "+91 98765 43228", organization: "Jain Ventures", status: "LOST" },
  { firstName: "Aadhya", lastName: "Agarwal", email: "aadhya.agarwal@example.com", phone: "+91 98765 43229", organization: "Agarwal Solutions", status: "WON" },
];

async function main() {
  // 1. Find or Create User
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found. Creating a default Admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'admin@powerx.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
  }
  console.log(`Using user: ${user.email} (ID: ${user.id})`);

  // 2. Create Leads
  console.log('Creating 20 fresh leads...');
  const createdLeads = [];
  for (const lead of leadsData) {
    const exists = await prisma.lead.findUnique({ where: { email: lead.email } });
    if (!exists) {
        const newLead = await prisma.lead.create({
        data: {
            ...lead,
            ownerId: user.id
        }
        });
        createdLeads.push(newLead);
        console.log(`Created lead: ${lead.email}`);
    } else {
        createdLeads.push(exists);
        console.log(`Lead already exists: ${lead.email}`);
    }
  }

  // 3. Create Activities
  console.log('Creating 20 fresh activities...');
  const activityTypes = ["NOTE", "CALL", "MEETING", "EMAIL", "STATUS_CHANGE"];
  const activityContents = [
      "discussed pricing strategy", "sent initial proposal", "follow up call regarding contract", "lunch meeting with key stakeholders", 
      "client interested in Q3 roadmap", "budget constraints mentioned", "requested customization in dashboard", 
      "asked for client references", "product demo scheduled", "contract sent for review", "negotiating terms", "client went silent"
  ];

  for (let i = 0; i < 20; i++) {
     const randomLead = createdLeads[Math.floor(Math.random() * createdLeads.length)];
     const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
     const randomContent = activityContents[Math.floor(Math.random() * activityContents.length)];
     
     await prisma.activity.create({
         data: {
             type: randomType,
             content: `${randomType} - ${randomContent}`,
             leadId: randomLead.id,
             userId: user.id
         }
     })
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
