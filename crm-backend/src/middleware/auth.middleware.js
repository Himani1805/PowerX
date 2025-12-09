import jwt from 'jsonwebtoken';

/**
 * 1. authenticate - Validates JWT token and attaches user data to req.user.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
export const authenticate = (req, res, next) => {
  // Extract token from Authorization header in "Bearer TOKEN_STRING" format.
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // A. If token is missing, return 401 Unauthorized.
  if (!token) {
    return res.status(401).json({ 
      message: 'Unauthorized: No token provided. Access denied.',
    });
  }

  try {
    // B. Validate token. JWT_SECRET must be present in .env.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not defined.');
    }
    
    // Decoded payload contains { id: userId, role: userRole }
    const decoded = jwt.verify(token, secret);

    // C. On success, attach user data to req.user
    req.user = decoded; 
    
    // Proceed to next middleware/handler
    next();
  } catch (error) {
    // D. If token invalid/expired, return 403 Forbidden.
    console.error('JWT Token Verification Error:', error.message);
    return res.status(403).json({ 
      message: 'Forbidden: Invalid or expired token.',
    });
  }
};

/**
 * 2. authorize - Implements Role-Based Access Control (RBAC).
 * Higher-order function that accepts an array of required roles.
 * @param {Array<string>} requiredRoles - Roles that can access the route (e.g., ['ADMIN', 'MANAGER'])
 * @returns {function} - Express middleware function
 */
export const authorize = (requiredRoles) => {
  // Ensure requiredRoles is a non-empty array
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    throw new Error('Authorization middleware requires an array of roles.');
  }

  // Return middleware function
  return (req, res, next) => {
    // Must run after authenticate middleware so req.user exists
    if (!req.user || !req.user.role) {
        // Indicates authenticate failed; authenticate should have already handled it
        return res.status(403).json({ message: 'Forbidden: User role not found.' });
    }

    // Check that the user's role is allowed
    const userRole = req.user.role;
    
    if (requiredRoles.includes(userRole)) {
      // Allowed
      next();
    } else {
      // Not allowed -> 403 Forbidden
      return res.status(403).json({ 
        message: `Forbidden: Role '${userRole}' is not authorized to access this resource.`,
        required: requiredRoles
      });
    }
  };
};