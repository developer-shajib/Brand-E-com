import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { cloudDelete, cloudUpload, findCloudinaryPublicId } from '../utils/cloudinary.js';

/**
 * @DESC Get All Users with trash set to true
 * @ROUTE /api/v1/user
 * @method GET
 * @access public
 */
export const fetchAllUser = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
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

  return res.status(200).json({
    message: 'Users retrieved successfully',
    data: users
  });
});

/**
 * @DESC Get Single User by ID
 * @ROUTE /api/v1/user/:id
 * @method GET
 * @access public
 */
export const fetchSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({
      errorMessage: 'User ID is required'
    });
  }

  // Check if ID is a valid MongoDB ObjectID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      errorMessage: 'Invalid user ID format'
    });
  }

  try {
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: {
        id,
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
      return res.status(404).json({
        errorMessage: 'User not found'
      });
    }

    return res.status(200).json({
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Error retrieving user',
      error: error.message
    });
  }
});

/**
 * @DESC Create a New User
 * @ROUTE /api/v1/user
 * @method POST
 * @access public
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, userRole, status, address, city, state, postalCode, country } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({
      errorMessage: 'Name, email, and password are required'
    });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({
      errorMessage: 'User with this email already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      userRole: userRole || 'CUSTOMER',
      status: status || 'ACTIVE',
      address: address || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      country: country || null,
      emailVerified: false
    }
  });

  if (!user) {
    return res.status(400).json({
      errorMessage: 'User not created'
    });
  }

  return res.status(201).json({
    message: 'User created successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      userRole: user.userRole,
      status: user.status,
      address: user.address,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      country: user.country,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @DESC Update User
 * @ROUTE /api/v1/user/:id
 * @method PUT
 * @access private
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, profileImage, userRole, status, address, city, state, postalCode, country, emailVerified } = req.body;

  // Validate ID
  if (!id) {
    return res.status(400).json({
      errorMessage: 'User ID is required'
    });
  }

  // Check if ID is a valid MongoDB ObjectID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      errorMessage: 'Invalid user ID format'
    });
  }

  // Check if at least one field is provided for update
  if (
    !name &&
    !email &&
    !password &&
    phone === undefined &&
    profileImage === undefined &&
    !userRole &&
    !status &&
    address === undefined &&
    city === undefined &&
    state === undefined &&
    postalCode === undefined &&
    country === undefined &&
    emailVerified === undefined
  ) {
    return res.status(400).json({
      errorMessage: 'No data provided'
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
        trash: false
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        errorMessage: 'User not found'
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          errorMessage: 'Email is already in use'
        });
      }
    }

    // Validate userRole if provided
    if (userRole && !['CUSTOMER', 'ADMIN'].includes(userRole)) {
      return res.status(400).json({
        errorMessage: 'Invalid user role. Must be CUSTOMER or ADMIN'
      });
    }

    // Validate status if provided
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        errorMessage: 'Invalid status. Must be ACTIVE or INACTIVE'
      });
    }

    // Prepare update data
    const updateData = {};

    // Only include fields that are provided in the request
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (userRole) updateData.userRole = userRole;
    if (status) updateData.status = status;
    if (address !== undefined) updateData.address = address || null;
    if (city !== undefined) updateData.city = city || null;
    if (state !== undefined) updateData.state = state || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    if (country !== undefined) updateData.country = country || null;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    // upload profile image
    if (req?.file) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudUpload(req.file.path, `${process.env.CLOUDINARY_FOLDER_NAME}/profile`);

        // Update profile image URL
        updateData.profileImage = uploadResult.secure_url;

        // Delete old profile image if exists
        if (existingUser.profileImage) {
          try {
            const publicId = findCloudinaryPublicId(existingUser.profileImage);
            if (publicId) {
              await cloudDelete(publicId);
            }
          } catch (deleteError) {
            console.error('Error deleting old profile image:', deleteError.message);
            // Continue with the update even if deletion fails
          }
        }
      } catch (uploadError) {
        // Log the error but don't fail the whole request
        console.error('Profile image upload failed:', uploadError.message);

        // Return error response if image upload was the primary purpose
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            errorMessage: `Profile image upload failed: ${uploadError.message}`
          });
        }
        // Otherwise continue with other updates
      }
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        errorMessage: 'User not found'
      });
    }

    // Handle validation errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        errorMessage: `${error.meta.target[0]} is already in use`
      });
    }

    // Handle other errors
    return res.status(500).json({
      errorMessage: 'Error updating user',
      error: error.message
    });
  }
});

/**
 * @DESC Delete User (Soft Delete)
 * @ROUTE /api/v1/user/:id
 * @method DELETE
 * @access private
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({
      errorMessage: 'User ID is required'
    });
  }

  // Check if ID is a valid MongoDB ObjectID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      errorMessage: 'Invalid user ID format'
    });
  }

  try {
    // Check if user exists and is not already trashed
    const existingUser = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        errorMessage: 'User not found or already deleted'
      });
    }

    // Delete profile image from Cloudinary
    if (existingUser.profileImage) {
      try {
        const publicId = findCloudinaryPublicId(existingUser.profileImage);
        if (publicId) {
          await cloudDelete(publicId);
        }
      } catch (deleteError) {
        console.error('Error deleting profile image:', deleteError.message);
      }
    }

    // Soft delete the user by setting trash to true
    const user = await prisma.user.delete({
      where: { id },
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

    return res.status(200).json({
      message: 'User deleted successfully',
      data: user
    });
  } catch (error) {
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        errorMessage: 'User not found'
      });
    }

    // Handle other errors
    return res.status(500).json({
      errorMessage: 'Error deleting user',
      error: error.message
    });
  }
});
