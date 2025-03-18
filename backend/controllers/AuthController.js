import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/tokenCreateVerify.js';
import { setTokenCookies } from '../utils/setCookie.js';
import { isValidEmail, isValidPassword, isValidPhone, isValidPostalCode, createToken, verifyToken } from '../utils/validation.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @DESC Login User
 * @ROUTE /api/v1/auth/login
 * @method POST
 * @access public
 */
export const userLogin = asyncHandler(async (req, res) => {
  const { name, email, password, loginType = 'email' } = req.body;

  let user;

  switch (loginType) {
    case 'email':
      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          errorMessage: 'Please provide email and password'
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({
          errorMessage: 'Please provide a valid email address'
        });
      }

      // Find user by email
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
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
          trash: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          errorMessage: 'No user found with this email!'
        });
      }

      // Check if password exists in the database
      if (!user.password) {
        return res.status(401).json({
          errorMessage: 'Invalid account credentials'
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Verify password
      if (!isPasswordValid) {
        return res.status(401).json({
          errorMessage: 'Invalid password'
        });
      }
      break;

    case 'google':
    case 'facebook':
      // Input validation
      if (!email || !name) {
        return res.status(400).json({
          errorMessage: 'Please provide email and name'
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({
          errorMessage: 'Please provide a valid email address'
        });
      }

      // Find or create user for social login
      user = await prisma.user.upsert({
        where: { email },
        update: {
          lastLogin: new Date()
        },
        create: {
          email: email,
          name: name,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for social accounts
          emailVerified: true,
          status: 'ACTIVE'
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
          trash: true,
          createdAt: true,
          updatedAt: true
        }
      });
      break;

    default:
      return res.status(400).json({
        errorMessage: 'Invalid login type'
      });
  }

  // Check if user is trashed
  if (user.trash) {
    return res.status(403).json({
      errorMessage: 'This account is not accessible. Please contact support.'
    });
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    return res.status(401).json({
      errorMessage: 'Your account is inactive. Please contact support.'
    });
  }

  // Check if email is verified (skip for social login)
  if (loginType === 'email' && !user.emailVerified) {
    return res.status(401).json({
      errorMessage: 'Please verify your email before logging in'
    });
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

  // Set cookies
  setTokenCookies(res, tokens);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // Remove sensitive data before sending response
  const { password: _, ...userData } = user;

  // Send response
  return res.status(200).json({
    message: 'Login successful',
    data: {
      ...userData,
      role: user.userRole
    }
  });
});

/**
 * @DESC Register User
 * @ROUTE /api/v1/auth/register
 * @method POST
 * @access public
 */
export const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, city, state, postalCode, country, loginType = 'email' } = req.body;

  // Validate input based on login type
  if (loginType === 'email') {
    // Validate required fields for email registration
    if (!name || !email || !password) {
      return res.status(400).json({
        errorMessage: 'Name, email, and password are required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        errorMessage: 'Password must be at least 6 characters long'
      });
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid phone number'
      });
    }

    // Validate postal code if provided
    if (postalCode && !isValidPostalCode(postalCode)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid postal code'
      });
    }
  } else if (['google', 'facebook'].includes(loginType)) {
    // Validate required fields for social login
    if (!name || !email) {
      return res.status(400).json({
        errorMessage: 'Name and email are required for social registration'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid email address'
      });
    }
  } else {
    return res.status(400).json({
      errorMessage: 'Invalid login type'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        errorMessage: 'User with this email already exists'
      });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      country: country || null,
      emailVerified: loginType !== 'email', // Social logins have verified emails
      status: 'ACTIVE',
      userRole: 'CUSTOMER', // Default role
      lastLogin: new Date()
    };

    // Add password hash for email registration
    if (loginType === 'email') {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    } else {
      // For social logins, create a random password
      userData.password = await bcrypt.hash(Math.random().toString(36), 10);
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: userData,
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
        trash: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // For email registration, we would typically send a verification email
    if (loginType === 'email') {
      // Generate verification token using createToken from validation.js
      const verificationToken = createToken(
        {
          userId: newUser.id,
          email: newUser.email,
          purpose: 'email_verification'
        },
        '24h'
      );

      // Store verification token in user record
      await prisma.user.update({
        where: { id: newUser.id },
        data: { verificationToken }
      });

      // Send verification email with token
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      // await sendVerificationEmail(newUser.email, newUser.name, verificationUrl);

      await sendEmail({
        email: newUser.email,
        subject: 'Verify your email',
        type: 'verification',
        data: {
          name: newUser.name,
          verificationUrl
        }
      });

      return res.status(201).json({
        message: 'Registration successful. Please verify your email.'
      });
    }

    // For social logins, automatically log the user in
    const tokens = generateTokens(newUser.id);
    setTokenCookies(res, tokens);

    return res.status(201).json({
      message: 'Registration successful',
      data: {
        ...newUser
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      errorMessage: 'An error occurred during registration. Please try again.'
    });
  }
});

/**
 * @DESC Verify Email
 * @ROUTE /api/v1/auth/verify-email?token=<token>
 * @method GET
 * @access public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      errorMessage: 'Verification token is required'
    });
  }

  // Verify the token using verifyToken from validation.js
  const decoded = verifyToken(token);

  if (!decoded || decoded.purpose !== 'email_verification') {
    return res.status(400).json({
      errorMessage: 'Invalid or expired verification token'
    });
  }

  const { userId, email } = decoded;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({
      errorMessage: 'User not found'
    });
  }

  // Check if email matches
  if (user.email !== email) {
    return res.status(400).json({
      errorMessage: 'Invalid verification token'
    });
  }

  // Update user's email verification status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      verificationToken: null // Clear the verification token
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
      trash: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const tokens = generateTokens(updatedUser.id);
  setTokenCookies(res, tokens);

  return res.status(200).json({
    message: 'Email verified successfully. You can now log in.',
    data: updatedUser,
    role: updatedUser.userRole
  });
});

/**
 * @DESC Logout User
 * @ROUTE /api/v1/auth/logout
 * @method POST
 * @access public
 */
export const userLogout = asyncHandler(async (req, res) => {
  // Clear cookies by setting them to expire immediately
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0) // Set expiration to epoch time (already expired)
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0) // Set expiration to epoch time (already expired)
  });

  return res.status(200).json({
    message: 'Logout successful'
  });
});

/**
 * @DESC Forgot Password
 * @ROUTE /api/v1/auth/forgot-password
 * @method POST
 * @access public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({
      errorMessage: 'Email is required'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      errorMessage: 'Please provide a valid email address'
    });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // For security reasons, don't reveal if the user exists or not
  if (!user) {
    return res.status(400).json({
      errorMessage: 'You have not registered with this email'
    });
  }

  // Check if user is trashed
  if (user.trash === true) {
    return res.status(400).json({
      errorMessage: 'This account is not accessible. Please contact support.'
    });
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    return res.status(400).json({
      errorMessage: 'This account is not active. Please contact support.'
    });
  }

  // Generate password reset token
  const resetToken = createToken(
    {
      userId: user.id,
      email: user.email,
      purpose: 'password_reset'
    },
    '1h' // Token expires in 1 hour
  );

  // Store reset token in user record
  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken }
  });

  // TODO: Send password reset email with token
  // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  // await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return res.status(200).json({
    message: 'Check your email for a password reset link'
  });
});

/**
 * @DESC Reset Password
 * @ROUTE /api/v1/auth/reset-password
 * @method POST
 * @access public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Validate input
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({
      errorMessage: 'Token, password and confirmPassword are required'
    });
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    return res.status(400).json({
      errorMessage: 'Password must be at least 6 characters long'
    });
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({
      errorMessage: 'Password and confirmation password do not match'
    });
  }
  // Verify the token
  const decoded = verifyToken(token);

  if (!decoded || decoded.purpose !== 'password_reset') {
    return res.status(400).json({
      errorMessage: 'Invalid or expired reset token'
    });
  }

  const { userId, email } = decoded;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({
      errorMessage: 'User not found'
    });
  }

  // Check if email matches
  if (user.email !== email) {
    return res.status(400).json({
      errorMessage: 'Invalid reset token'
    });
  }

  // Check if token matches stored token
  if (user.resetPasswordToken !== token) {
    return res.status(400).json({
      errorMessage: 'Invalid reset token'
    });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user's password and clear the reset token
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetPasswordToken: null
    }
  });

  return res.status(200).json({
    message: 'Password has been reset successfully. You can now log in with your new password.'
  });
});

/**
 * @DESC Resend Verification Email
 * @ROUTE /api/v1/auth/resend-verification-email
 * @method POST
 * @access public
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({
      errorMessage: 'Email is required'
    });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(400).json({
      errorMessage: 'User not found'
    });
  }

  // Check if user is trashed
  if (user.trash === true) {
    return res.status(400).json({
      errorMessage: 'This account is not accessible. Please contact support.'
    });
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    return res.status(400).json({
      errorMessage: 'This account is not active. Please contact support.'
    });
  }

  // Check if email is verified
  if (user.emailVerified === true) {
    return res.status(400).json({
      errorMessage: 'Email is already verified'
    });
  }

  // Check verification token expired or not if expired then send email if not expired then return error
  if (user.verificationToken) {
    const decoded = verifyToken(user.verificationToken);
    if (decoded || decoded.purpose === 'email_verification') {
      return res.status(400).json({
        errorMessage: 'Already sent a verification email. Please check your email.'
      });
    }
  }

  // Generate verification token
  const verificationToken = createToken(
    {
      userId: user.id,
      email: user.email,
      purpose: 'email_verification'
    },
    '24h'
  );

  // Store verification token in user record
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken }
  });

  // Send verification email with token
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await sendEmail({
    email: user.email,
    subject: 'Verify your email',
    type: 'verification',
    data: { name: user.name, verificationUrl }
  });

  return res.status(200).json({
    message: 'Verification email sent successfully'
  });
});
