import { PrismaClient } from '@prisma/client';
import createError from '../utils/createError.js';

const prisma = new PrismaClient();

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
async function readAllUser(request, response, next) {
    try {
        // Get all users from the database using Prisma
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        // Send success response
        response.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in readAllUser:', error);
        next(createError(500, 'Failed to fetch users'));
    }
}

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
async function readUser(request, response, next) {
    try {
        const { id } = request.params;

        // Find user by ID using Prisma
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return next(createError(404, 'User not found'));
        }

        response.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in readUser:', error);
        next(createError(500, 'Failed to fetch user'));
    }
}

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
async function updateUser(request, response, next) {
    try {
        const { id } = request.params;
        const { name, email, role, isActive } = request.body;

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            return next(createError(404, 'User not found'));
        }

        // Update user using Prisma
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name || userExists.name,
                email: email || userExists.email,
                role: role || userExists.role,
                isActive: isActive !== undefined ? isActive : userExists.isActive
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        response.status(200).json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        
        // Handle unique constraint violation for email
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return next(createError(400, 'Email already in use'));
        }
        
        next(createError(500, 'Failed to update user'));
    }
}

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
async function deleteUser(request, response, next) {
    try {
        const { id } = request.params;

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            return next(createError(404, 'User not found'));
        }

        // Prevent deleting own account
        if (id === request.user.id) {
            return next(createError(400, 'You cannot delete your own account'));
        }

        // Delete user using Prisma
        await prisma.user.delete({
            where: { id }
        });

        response.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        
        // Handle foreign key constraint violation
        if (error.code === 'P2003') {
            return next(createError(400, 'Cannot delete user with associated records'));
        }
        
        next(createError(500, 'Failed to delete user'));
    }
}

export { readAllUser, readUser, updateUser, deleteUser };
