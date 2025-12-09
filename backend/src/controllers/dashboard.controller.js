import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

/**
 * @desc Get lead counts grouped by status (NEW, CONTACTED, QUALIFIED, LOST, WON)
 * @route GET /api/v1/dashboard/status
 * @access Private (ADMIN, MANAGER)
 */
export const getLeadsByStatus = async (req, res, next) => {
  try {
    const where = {};
    // If not Admin/Manager, filter by owner
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
        where.ownerId = req.user.id;
    }

    // 1. Use Prisma's groupBy functionality on Lead model to count all leads by status
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      where: where,
      _count: {
        id: true,
      },
      orderBy: {
        status: 'asc',
      },
    });

    // Format data for Chart.js or Recharts
    const formattedData = statusCounts.map(item => ({
      status: item.status,
      count: item._count.id,
    }));

    res.status(200).json({
      status: 'success',
      message: 'Lead counts by status retrieved successfully.',
      data: formattedData,
    });
  } catch (error) {
    // Use AppError to ensure robust error handling
    next(new AppError('Failed to retrieve leads by status. ' + error.message, 500));
  }
};

/**
 * @desc Get lead counts grouped by owner (User)
 * @route GET /api/v1/dashboard/owner
 * @access Private (ADMIN, MANAGER)
 */
export const getLeadsByOwner = async (req, res, next) => {
  try {
    // 2. Group leads by ownerId
    const ownerCounts = await prisma.lead.groupBy({
      by: ['ownerId'],
      _count: {
        id: true,
      },
    });

    // 2. Get related user details (name, email)
    const ownerIds = ownerCounts.map(item => item.ownerId);

    const owners = await prisma.user.findMany({
      where: {
        id: { in: ownerIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 2. Combine and format data
    const formattedData = ownerCounts.map(item => {
      const owner = owners.find(o => o.id === item.ownerId);
      return {
        ownerId: item.ownerId,
        ownerName: owner ? owner.name : 'Unknown User',
        ownerRole: owner ? owner.role : 'Unknown',
        count: item._count.id,
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Lead counts by owner retrieved successfully.',
      data: formattedData,
    });
  } catch (error) {
    // Use AppError to ensure robust error handling
    next(new AppError('Failed to retrieve leads by owner. ' + error.message, 500));
  }
};