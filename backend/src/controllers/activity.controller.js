import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

// Define the allowed activity types from the Prisma schema enum
const ALLOWED_ACTIVITY_TYPES = ['NOTE', 'CALL', 'MEETING', 'STATUS_CHANGE', 'EMAIL'];

/**
 * @desc Create a new activity for a specific lead
 * @route POST /api/v1/leads/:leadId/activities
 * @access Private (All Roles)
 */
export const createActivity = async (req, res, next) => {
  // Get Lead ID from req.params and User ID from req.user
  const leadId = parseInt(req.params.leadId);
  const userId = req.user.id;
  const { type, content } = req.body;

  if (isNaN(leadId)) {
    return next(new AppError('Invalid lead ID format in parameters.', 400));
  }
  if (!type || !content) {
    return next(new AppError('Activity type and content are required.', 400));
  }
  if (!ALLOWED_ACTIVITY_TYPES.includes(type)) {
    return next(new AppError(`Invalid activity type: ${type}. Allowed types are: ${ALLOWED_ACTIVITY_TYPES.join(', ')}`, 400));
  }

  try {
    // Ensure the lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      // Return 404 AppError
      return next(new AppError(`Lead with ID ${leadId} not found.`, 404));
    }

    // Create activity linked to the lead and user via Prisma
    const newActivity = await prisma.activity.create({
      data: {
        type: type, // Ensure type matches the Prisma Enum
        content,
        leadId,
        userId,
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Emit Socket.io event for real-time updates
    if (global.io) {
      global.io.emit('lead_activity_update', {
        type: 'NEW_ACTIVITY',
        notification: `New activity added: ${type} - ${content.substring(0, 30)}...`,
        data: newActivity
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Activity created successfully.',
      data: {
        activity: newActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all activities for a specific lead
 * @route GET /api/v1/leads/:leadId/activities
 * @access Private (All Roles)
 */
export const getActivitiesForLead = async (req, res, next) => {
  // Get Lead ID from req.params
  const leadId = parseInt(req.params.leadId);

  if (isNaN(leadId)) {
    return next(new AppError('Invalid lead ID format in parameters.', 400));
  }

  try {
    // Ensure the lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return next(new AppError(`Lead with ID ${leadId} not found.`, 404));
    }
    
    // Fetch all activities for the given lead ID using Prisma
    const activities = await prisma.activity.findMany({
      where: { leadId },
      include: {
        user: { // include actor's name and email
          select: {
            name: true,
            email: true,
          },
        },
      },
      // Sort by createdAt descending
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};










