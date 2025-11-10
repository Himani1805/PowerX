import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class LeadService {
  async createLead(data, userId) {
    console.log("lead service6 user id", data, userId)
    return prisma.lead.create({
      data: {
        ...data,
        createdById: userId,
        updatedById: userId,
        ownerId: data.ownerId || userId, // Default to creator if no owner specified
      },
      include: {
        owner: true,
        createdBy: true,
        updatedBy: true
      }
    });
  }

  async updateLead(id, data, userId) {
    // First get the current lead to track changes
    const lead = await prisma.lead.findUnique({ 
      where: { id },
      include: { owner: true, createdBy: true, updatedBy: true }
    });
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // Track changes
    const changes = [];
    for (const [key, value] of Object.entries(data)) {
      // Skip internal fields and unchanged values
      if (['updatedAt', 'updatedBy', 'createdAt', 'createdBy', 'owner'].includes(key)) {
        continue;
      }
      
      const oldValue = lead[key];
      if (oldValue !== value) {
        changes.push({
          leadId: id,
          userId,
          action: 'UPDATE',
          field: key,
          oldValue: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
          newValue: value !== null && value !== undefined ? String(value) : null
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...data,
      updatedAt: new Date(),
      updatedBy: {
        connect: { id: userId }
      }
    };

    // Remove any fields that shouldn't be directly updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.owner;

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
        createdBy: true,
        updatedBy: true
      }
    });

    // Save history
    if (changes.length > 0) {
      await prisma.leadHistory.createMany({ data: changes });
    }

    return updatedLead;
  }

  async getLeadHistory(leadId) {
    return prisma.leadHistory.findMany({
      where: { leadId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Add other CRUD methods with similar history tracking
}

// Export a single instance of the service
const leadService = new LeadService();
export default leadService;