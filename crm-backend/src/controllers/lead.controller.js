// import prisma from '../utils/prisma.js';
// import AppError from '../utils/AppError.js';
// // 1. Import Email Service
// import { sendLeadStatusUpdateEmail } from '../services/email.service.js';

// // Define user roles for easy access and comparison
// const SALES_EXECUTIVE = 'SALES_EXECUTIVE';
// const MANAGER = 'MANAGER';
// const ADMIN = 'ADMIN';

// /**
//  * @desc Create a new lead
//  * @route POST /api/v1/leads
//  * @access Private (All Roles)
//  */
// export const createLead = async (req, res, next) => {
//   // Set ownerId from the authenticated user
//   const ownerId = req.user.id;
//   const { firstName, lastName, email, phone, organization } = req.body;

//   // Input validation
//   if (!firstName || !lastName || !email) {
//     return next(new AppError('Please provide first name, last name, and email for the lead.', 400));
//   }
  
//   try {
//     // Create the new lead (default status is NEW in schema.prisma)
//     const newLead = await prisma.lead.create({
//       data: {
//         firstName,
//         lastName,
//         email,
//         phone,
//         organization,
//         ownerId, // Set ownerId
//       },
//     });

//     res.status(201).json({
//       status: 'success',
//       data: {
//         lead: newLead,
//       },
//     });
//   } catch (error) {
//     // Prisma P2002 error for duplicate email will be handled by global error middleware
//     next(error);
//   }
// };

// /**
//  * @desc Get all leads (with RBAC filtering)
//  * @route GET /api/v1/leads
//  * @access Private (All Roles)
//  */
// export const getLeads = async (req, res, next) => {
//   try {
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     let whereClause = {};

//     // Apply filtering based on role
//     if (userRole === SALES_EXECUTIVE) {
//       // SALES_EXECUTIVE can only see their owned leads
//       whereClause.ownerId = userId;
//     } 
//     // ADMIN and MANAGER see all leads (whereClause remains empty)

//     const leads = await prisma.lead.findMany({
//       where: whereClause,
//       include: {
//         owner: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     res.status(200).json({
//       status: 'success',
//       results: leads.length,
//       data: {
//         leads,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Get a specific lead by ID
//  * @route GET /api/v1/leads/:id
//  * @access Private (All Roles)
//  */
// export const getLeadById = async (req, res, next) => {
//   const { id } = req.params;
//   const leadId = parseInt(id);

//   if (isNaN(leadId)) {
//     return next(new AppError('Invalid lead ID format.', 400));
//   }

//   try {
//     const lead = await prisma.lead.findUnique({
//       where: { id: leadId },
//       include: {
//         owner: {
//           select: { id: true, name: true, email: true, role: true },
//         },
//         activities: {
//           orderBy: { createdAt: 'desc' },
//           include: {
//             user: { select: { name: true } }
//           }
//         }
//       },
//     });

//     // Check if lead exists
//     if (!lead) {
//       return next(new AppError(`Lead with ID ${leadId} not found.`, 404));
//     }

//     const userRole = req.user.role;
//     const userId = req.user.id;

//     // RBAC Check: SALES_EXECUTIVE must be the owner
//     const isOwner = lead.ownerId === userId;
//     const isHighPrivilege = userRole === ADMIN || userRole === MANAGER;

//     if (!isOwner && !isHighPrivilege) {
//         // Forbidden: User cannot view a lead they don't own unless they are ADMIN/MANAGER
//         return next(new AppError('Forbidden: You do not have permission to view this lead.', 403));
//     }
    
//     res.status(200).json({
//       status: 'success',
//       data: {
//         lead,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Update a lead by ID
//  * @route PUT /api/v1/leads/:id
//  * @access Private (All Roles)
//  */
// export const updateLead = async (req, res, next) => {
//   const { id } = req.params;
//   const leadId = parseInt(id);
//   const updateData = req.body;

//   if (isNaN(leadId)) {
//     return next(new AppError('Invalid lead ID format.', 400));
//   }

//   try {
//     // Fetch existing lead to check ownership (RBAC), current status (for email), and owner details
//     const existingLead = await prisma.lead.findUnique({ 
//         where: { id: leadId },
//         include: { 
//             owner: { select: { email: true } } // Fetch only email
//         } 
//     });

//     if (!existingLead) {
//       return next(new AppError(`Lead with ID ${leadId} not found.`, 404));
//     }

//     // 2. Get current status (oldStatus)
//     const oldStatus = existingLead.status;
    
//     // RBAC Check: User must be the owner OR ADMIN/MANAGER
//     const userRole = req.user.role;
//     const userId = req.user.id;
//     const isOwner = existingLead.ownerId === userId;
//     const isHighPrivilege = userRole === ADMIN || userRole === MANAGER;

//     if (!isOwner && !isHighPrivilege) {
//         return next(new AppError('Forbidden: You can only update leads you own.', 403));
//     }
    
//     const allowedUpdates = [
//         'firstName', 'lastName', 'email', 'phone', 'organization', 'status', 'ownerId'
//     ];
    
//     const dataToUpdate = Object.keys(updateData)
//         .filter(key => allowedUpdates.includes(key))
//         .reduce((obj, key) => {
//             if (key === 'status' && !['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'WON'].includes(updateData[key])) {
//                 return obj;
//             }
//             obj[key] = updateData[key];
//             return obj;
//         }, {});

//     if (Object.keys(dataToUpdate).length === 0) {
//         return next(new AppError('No valid fields provided for update.', 400));
//     }

//     // Update the lead
//     const updatedLead = await prisma.lead.update({
//       where: { id: leadId },
//       data: dataToUpdate,
//       // Fetch updated owner details (if ownerId also changed)
//       include: { owner: { select: { email: true } } } 
//     });

//     const newStatus = updatedLead.status;
//     // 3. Check whether new status differs from old status
//     const statusChanged = dataToUpdate.status && newStatus !== oldStatus;

//     if (statusChanged) {
//         // 4. If status changed, call sendLeadStatusUpdateEmail
//         const recipientEmail = updatedLead.owner.email;
//         const leadFullName = `${updatedLead.firstName} ${updatedLead.lastName}`;
//         // Note: req.user typically has only id and role, so fetching updater name from DB is correct.
//         // For simplicity, assume req.user has name or use a placeholder.
//         // For robustness, fetch updater name.
        
//         const updater = await prisma.user.findUnique({
//             where: { id: userId },
//             select: { name: true }
//         });
//         const updaterName = updater ? updater.name : `User ID: ${userId}`;

//         // Send email (should be non-blocking)
//         sendLeadStatusUpdateEmail(
//             recipientEmail, 
//             leadFullName, 
//             newStatus, 
//             updaterName
//         );
        
//         // Also add STATUS_CHANGE activity log
//         await prisma.activity.create({
//             data: {
//                 leadId: updatedLead.id,
//                 userId: userId,
//                 type: 'STATUS_CHANGE',
//                 content: `Status changed from ${oldStatus} to ${newStatus} by ${updaterName}.`,
//             }
//         });
        
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Lead updated successfully.',
//       data: {
//         lead: updatedLead,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Delete a lead by ID
//  * @route DELETE /api/v1/leads/:id
//  * @access Private (ADMIN, MANAGER) - Checked in route middleware
//  */
// export const deleteLead = async (req, res, next) => {
//   const { id } = req.params;
//   const leadId = parseInt(id);

//   if (isNaN(leadId)) {
//     return next(new AppError('Invalid lead ID format.', 400));
//   }

//   try {
//     // Check if lead exists before attempting delete
//     const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });

//     if (!existingLead) {
//         return next(new AppError(`Lead with ID ${leadId} not found.`, 404));
//     }
    
//     // Delete the lead
//     await prisma.lead.delete({
//       where: { id: leadId },
//     });

//     // 204 No Content is the standard response for a successful deletion
//     res.status(204).json({ 
//         status: 'success',
//         data: null 
//     });
//   } catch (error) {
//     next(error);
//   }
// };


import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';
import { sendLeadStatusUpdateEmail } from '../services/email.service.js'; // Email Service Import

// Utility function to determine Prisma filtering based on role
const getLeadFiltering = (user) => {
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        return {}; // Admins/Managers see all leads
    }
    // Sales Executives only see leads they own
    return { ownerId: user.id };
};

/**
 * @desc Create a new lead
 * @route POST /api/v1/leads
 * @access Private (All Sales Roles)
 */
export const createLead = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, organization } = req.body;
        const ownerId = req.user.id; // Set owner to the authenticated user

        // Basic validation
        if (!firstName || !lastName || !email) {
            return next(new AppError('Please provide first name, last name, and email for the lead.', 400));
        }

        const newLead = await prisma.lead.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                organization,
                status: 'NEW', // Default status
                ownerId,
            },
        });

        res.status(201).json({
            status: 'success',
            data: newLead,
        });
    } catch (error) {
        // Handle unique constraint error (e.g., email already exists)
        if (error.code === 'P2002') {
            return next(new AppError('A lead with this email already exists.', 400));
        }
        next(error);
    }
};

/**
 * @desc Get all leads (with role-based filtering)
 * @route GET /api/v1/leads
 * @access Private (All Roles)
 */
export const getLeads = async (req, res, next) => {
    try {
        const filter = getLeadFiltering(req.user);
        const { search, status, page = 1, limit = 10, sort = 'desc' } = req.query;

        // 1. Search Filter
        if (search) {
            filter.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { organization: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        // 2. Status Filter
        if (status && status !== 'ALL') {
            filter.status = status;
        }

        // 3. Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // 4. Execute Query
        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where: filter,
                include: {
                    owner: { select: { name: true, role: true } }
                },
                orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
                skip: skip,
                take: limitNum,
            }),
            prisma.lead.count({ where: filter })
        ]);

        res.status(200).json({
            status: 'success',
            results: leads.length,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            },
            data: leads,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Get a single lead
 * @route GET /api/v1/leads/:id
 * @access Private (All Roles)
 */
export const getLeadById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const filter = getLeadFiltering(req.user);

        const lead = await prisma.lead.findUnique({
            where: { id, ...filter },
            include: {
                owner: { select: { name: true, role: true } }
            }
        });

        if (!lead) {
            return next(new AppError('Lead not found or you do not have permission to view it.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: lead,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Update a lead (and trigger email if status changes)
 * @route PUT /api/v1/leads/:id
 * @access Private (All Sales Roles)
 */
export const updateLead = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;
        console.log(`Update Lead Request for ID ${id}:`, req.body); // Debug Log
        const { status, ...updateData } = req.body;

        // 1. Get the current lead and check ownership/role for modification
        const oldLead = await prisma.lead.findUnique({ where: { id } });

        if (!oldLead) {
            return next(new AppError('Lead not found.', 404));
        }

        const isOwner = oldLead.ownerId === userId;
        const isManagerOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'MANAGER';

        // Restriction: Only owner, manager, or admin can modify
        if (!isOwner && !isManagerOrAdmin) {
            return next(new AppError('You do not have permission to update this lead.', 403));
        }

        // Filter allowed fields
        const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'organization', 'status'];
        const dataToUpdate = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                dataToUpdate[key] = req.body[key];
            }
        });

        if (Object.keys(dataToUpdate).length === 0) {
             return next(new AppError('No valid fields provided for update.', 400));
        }

        // 2. Perform the update
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: dataToUpdate,
        });

        // 3. Check for Status Change and Trigger Email (NEW LOGIC)
        if (status && status !== oldLead.status) {
            // Fetch user name for the activity log and email
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            const userName = user ? user.name : 'Unknown User';

            // 3a. Create Activity Log
            const activityContent = `Status changed from ${oldLead.status} to ${status} by ${userName}.`;
            const newActivity = await prisma.activity.create({
                data: {
                    leadId: id,
                    userId: userId,
                    type: 'STATUS_CHANGE',
                    content: activityContent
                },
                include: { user: { select: { name: true, email: true } } }
            });

            // 3b. Emit Socket Event
            if (global.io) {
                global.io.emit('lead_activity_update', {
                    type: 'STATUS_CHANGE',
                    notification: `Lead status updated to ${status} by ${userName}`,
                    data: newActivity
                });
            }

            // 3c. Trigger email asynchronously (non-blocking)
            sendLeadStatusUpdateEmail(
                updatedLead.email,
                updatedLead.firstName,
                updatedLead.status,
                userName
            ).catch(err => {
                console.error("Email sending failed (non-blocking):", err.message);
                // Continue execution even if email fails
            });
        }

        res.status(200).json({
            status: 'success',
            data: updatedLead,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Delete a lead
 * @route DELETE /api/v1/leads/:id
 * @access Private (ADMIN, MANAGER only - checked in route)
 */
export const deleteLead = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) {
            return next(new AppError('Lead not found.', 404));
        }

        // Manually delete related activities first (since Cascade is not set in schema)
        await prisma.activity.deleteMany({
            where: { leadId: id },
        });

        // Delete the lead
        await prisma.lead.delete({
            where: { id },
        });

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};