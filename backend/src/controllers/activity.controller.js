import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
export const createActivity = async (req, res) => {
  try {
    const { leadId, type, content } = req.body;
    
    // Validate input
    if (!leadId || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leadId, type, and content'
      });
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        type,
        content,
        leadId,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all activities for a lead
// @route   GET /api/leads/:leadId/activities
// @access  Private
export const getLeadActivities = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check if lead exists and user has access
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if user is authorized (owner, admin, or manager)
    if (
      lead.ownerId !== req.user.id && 
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'MANAGER'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these activities'
      });
    }

    // Get activities
    const activities = await prisma.activity.findMany({
      where: { leadId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the activity
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        lead: {
          select: { ownerId: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is authorized (creator, admin, or manager)
    if (
      activity.createdById !== req.user.id && 
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'MANAGER'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }

    // Delete activity
    await prisma.activity.delete({
      where: { id }
    });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recent activities across all leads (for dashboard)
// @route   GET /api/activities/recent
// @access  Private
export const getRecentActivities = async (req, res) => {
  try {
    // For sales users, only show activities from their leads
    const whereClause = req.user.role === 'SALES' 
      ? { lead: { ownerId: req.user.id } } 
      : {};

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lead: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to 10 most recent activities
    });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
