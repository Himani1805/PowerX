import { PrismaClient } from '@prisma/client';
// import { createActivity } from './activity.controller.js';

const prisma = new PrismaClient();

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (ADMIN, MANAGER, SALES)
export const createLead = async (req, res) => {
  try {
    const { name, company, email, phone, source, status, notes } = req.body;
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        source: source || 'WEBSITE',
        status: status || 'NEW',
        notes,
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity
    await createActivity({
      leadId: lead.id,
      userId: req.user.id,
      type: 'NOTE',
      content: 'Lead created'
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all leads (ADMIN and MANAGER only)
// @route   GET /api/leads
// @access  Private (ADMIN, MANAGER)
export const getLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
              createdBy: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      success: true,
      count: leads.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get leads for the current user (SALES)
// @route   GET /api/leads/my-leads
// @access  Private (SALES)
export const getMyLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = { ownerId: req.user.id };
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      success: true,
      count: leads.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    console.error('Get my leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
export const getLead = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user is authorized to view this lead
    if (req.user.role === 'SALES' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res) => {
  try {
    const { name, company, email, phone, source, status, notes } = req.body;
    
    // Get the lead first to check ownership
    const existingLead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user is authorized to update this lead
    if (req.user.role === 'SALES' && existingLead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Track changes for activity log
    const changes = [];
    if (name && name !== existingLead.name) changes.push(`Name changed to "${name}"`);
    if (company && company !== existingLead.company) changes.push(`Company changed to "${company}"`);
    if (email && email !== existingLead.email) changes.push(`Email changed to "${email}"`);
    if (phone && phone !== existingLead.phone) changes.push(`Phone changed to "${phone}"`);
    if (source && source !== existingLead.source) changes.push(`Source changed to "${source}"`);
    if (status && status !== existingLead.status) changes.push(`Status changed to "${status}"`);
    if (notes && notes !== existingLead.notes) changes.push('Notes updated');

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        name,
        company,
        email,
        phone,
        source,
        status,
        notes
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity if there are changes
    if (changes.length > 0) {
      await createActivity({
        leadId: updatedLead.id,
        userId: req.user.id,
        type: 'NOTE',
        content: changes.join(', ')
      });
    }

    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (ADMIN, MANAGER)
export const deleteLead = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Delete related activities first
    await prisma.activity.deleteMany({
      where: { leadId: req.params.id }
    });

    // Then delete the lead
    await prisma.lead.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Transfer lead to another user
// @route   PUT /api/leads/:id/transfer
// @access  Private (ADMIN, MANAGER)
export const transferLead = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if the target user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update lead owner
    const updatedLead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity
    await createActivity({
      leadId: updatedLead.id,
      userId: req.user.id,
      type: 'NOTE',
      content: `Lead transferred from ${lead.owner.name} to ${user.name}`
    });

    // Create notification for the new owner
    await prisma.notification.create({
      data: {
        type: 'LEAD_TRANSFERRED',
        message: `You have been assigned a new lead: ${lead.name}`,
        userId: userId
      }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Transfer lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
