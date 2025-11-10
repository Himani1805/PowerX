import { PrismaClient } from '@prisma/client';
import leadService from '../services/leadService.js';
import { createActivity } from './activity.controller.js';

const prisma = new PrismaClient();

// @desc    Get all leads with pagination and filtering
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter based on user role
    let where = {};
    
    // Sales users can only see their own leads
    if (req.user.role === 'SALES') {
      where.ownerId = req.user.id;
    }
    
    // Add status filter if provided
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Get total count for pagination
    const total = await prisma.lead.count({ where });
    
    // Get paginated leads
    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      count: leads.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (ADMIN, MANAGER, SALES)
export const createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      status: req.body.status || 'NEW',
      source: req.body.source || 'WEBSITE'
    };
    console.log("user",req.user)
    const lead = await leadService.createLead(leadData, req.user.id);
console.log("activity  1", lead.id, req.user.id)
    // Create activity - pass the minimal required data
    const activityData = {
      leadId: lead.id,
      userId: req.user.id,
      type: 'NOTE',
      content: 'Lead created'
    };
    
    // Call createActivity with the proper context
    await createActivity({
      body: activityData,
      user: { id: req.user.id }
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lead with history
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
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

    // Check permissions
    if (req.user.role === 'SALES' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    // Get lead history
    const history = await leadService.getLeadHistory(lead.id);
    
    res.json({
      ...lead,
      history
    });
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
    const { id } = req.params;
    const updateData = req.body;

    // Check if lead exists and user has permission
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { ownerId: true, status: true }
    });

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'SALES' && existingLead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Update lead (history is handled in the service)
    const updatedLead = await leadService.updateLead(
      id, 
      updateData, 
      req.user.id
    );

    // Create activity for significant changes
    const changes = [];
    if (updateData.status && updateData.status !== existingLead.status) {
      changes.push(`Status changed to ${updateData.status}`);
    }
    if (updateData.ownerId && updateData.ownerId !== existingLead.ownerId) {
      const newOwner = await prisma.user.findUnique({
        where: { id: updateData.ownerId },
        select: { name: true }
      });
      changes.push(`Ownership transferred to ${newOwner.name}`);
    }
console.log("activity  2")
    if (changes.length > 0) {
      await createActivity({
        leadId: id,
        userId: req.user.id,
        type: 'SYSTEM',
        content: changes.join(', ')
      });
    }

    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (ADMIN, MANAGER)
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and user has permission
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Only admins and managers can delete leads
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Not authorized to delete leads' });
    }

    console.log("activity  3")
    // Create activity first, before deleting the lead
    try {
      await createActivity({
        leadId: id,
        userId: req.user.id,
        type: 'NOTE',
        content: 'Lead deleted'
      });
    } catch (activityError) {
      console.error('Error creating activity for deleted lead:', activityError);
      // Continue with deletion even if activity creation fails
    }

    // First, delete all related activities
    await prisma.activity.deleteMany({
      where: { leadId: id }
    });

    // Then delete the lead
    await prisma.lead.delete({
      where: { id }
    });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's leads
// @route   GET /api/leads/my-leads
// @access  Private
export const getMyLeads = async (req, res) => {
  console.log("Hina", req.user)
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter for current user's leads
    const where = { ownerId: req.user.id };
    
    // Add status filter if provided
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Get total count for pagination
    const total = await prisma.lead.count({ where });
    
    // Get paginated leads
    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      count: leads.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    console.error('Get my leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Transfer lead to another user
// @route   PUT /api/leads/:id/transfer
// @access  Private (ADMIN, MANAGER)
export const transferLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ message: 'New owner ID is required' });
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { ownerId: true, status: true }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if new owner exists
    const newOwner = await prisma.user.findUnique({
      where: { id: newOwnerId },
      select: { id: true, name: true, email: true }
    });

    if (!newOwner) {
      return res.status(404).json({ message: 'New owner not found' });
    }

    // Only admins and managers can transfer leads
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Not authorized to transfer leads' });
    }

    // Update lead owner
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ownerId: newOwnerId,
        updatedById: req.user.id
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
console.log("activity  4")
    // Create activity
    await createActivity({
      leadId: id,
      userId: req.user.id,
      type: 'SYSTEM',
      content: `Lead transferred to ${newOwner.name}`
    });

    res.json({
      success: true,
      message: 'Lead transferred successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Transfer lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
