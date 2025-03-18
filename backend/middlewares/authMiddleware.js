import JWT from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import { setTokenCookies } from '../utils/setCookie.js';
import { generateTokens } from '../utils/tokenCreateVerify.js';

/**
 * Middleware to verify JWT token
 * Extracts token from cookies or Authorization header
 * Sets req.user if token is valid
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from cookies
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Get token from Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        errorMessage: 'Not authorized, no token provided'
      });
    }

    return refreshAccessToken(req, res, next);
  }

  try {
    // Verify token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        trash: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        userRole: true,
        status: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        errorMessage: 'Not authorized, user not found'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        errorMessage: 'Your account is inactive. Please contact support.'
      });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    // Handle token expiration
    if (error.name === 'TokenExpiredError') {
      // Try to refresh the token
      return refreshAccessToken(req, res, next);
    }

    // Handle invalid token
    return res.status(401).json({
      errorMessage: 'Not authorized, invalid token'
    });
  }
});

/**
 * Middleware to refresh access token using refresh token
 * If refresh token is valid, generates new access token
 */
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  // Get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      errorMessage: 'Access token expired and no refresh token available'
    });
  }

  try {
    // Verify refresh token
    const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        trash: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        userRole: true,
        status: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        errorMessage: 'Not authorized, user not found'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        errorMessage: 'Your account is inactive. Please contact support.'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    // Set new cookies
    setTokenCookies(res, tokens);

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    // Handle token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        errorMessage: 'Refresh token expired, please login again'
      });
    }

    // Handle invalid token
    return res.status(401).json({
      errorMessage: 'Not authorized, invalid refresh token'
    });
  }
});

/**
 * Middleware to restrict access to specific roles
 * @param {Array} roles - Array of roles allowed to access the route
 *  Restrict to admin users only
 // router.route('/').post(verifyToken, restrictTo('ADMIN'), createUser);
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
        errorMessage: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
