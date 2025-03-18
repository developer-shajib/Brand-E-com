import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';

/**
 * @DESC Fetch all permissions with filtering, sorting and pagination
 * @ROUTE GET /api/v1/permissions
 * @ACCESS Private/Admin
 */
export const fetchAllPermissions = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status } = req.query;

    // Validate pagination parameters
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        errorMessage: 'Page must be a positive number'
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({
        errorMessage: 'Limit must be between 1 and 100'
      });
    }

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {
      trash: false
    };

    // Add status filter if provided
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }];
    }

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Execute count query for total
    const totalPermissions = await prisma.permission.count({
      where: filter
    });

    // Execute main query with pagination
    const permissions = await prisma.permission.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalPermissions / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Permissions fetched successfully',
      data: permissions,
      pagination: {
        totalPermissions,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching permissions',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single permission by ID or slug
 * @ROUTE GET /api/v1/permissions/:idOrSlug
 * @ACCESS Private/Admin
 */
export const fetchSinglePermission = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the permission
    const permission = await prisma.permission.findFirst({
      where: query
    });

    // Check if permission exists
    if (!permission) {
      return res.status(404).json({
        errorMessage: 'Permission not found'
      });
    }

    // Return response
    return res.status(200).json({
      message: 'Permission fetched successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching permission',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new permission
 * @ROUTE POST /api/v1/permissions
 * @ACCESS Private/Admin
 */
export const createPermission = asyncHandler(async (req, res) => {
  try {
    const { name, status = true } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Permission name is required'
      });
    }

    // Check if permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        trash: false
      }
    });

    if (existingPermission) {
      return res.status(400).json({
        errorMessage: 'Permission with this name already exists'
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if slug already exists
    const existingSlug = await prisma.permission.findFirst({
      where: {
        slug,
        trash: false
      }
    });

    if (existingSlug) {
      return res.status(400).json({
        errorMessage: 'Permission with this slug already exists'
      });
    }

    // Create permission in database
    const newPermission = await prisma.permission.create({
      data: {
        name,
        slug,
        status: Boolean(status)
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Permission created successfully',
      data: newPermission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({
      errorMessage: 'Error creating permission',
      error: error.message
    });
  }
});

/**
 * @DESC Update a permission
 * @ROUTE PUT /api/v1/permissions/:idOrSlug
 * @ACCESS Private/Admin
 */
export const updatePermission = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { name, status } = req.body;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Validate input
    if (!name && status === undefined) {
      return res.status(400).json({
        errorMessage: 'At least one field (name or status) is required for update'
      });
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findFirst({
      where: query
    });

    if (!existingPermission) {
      return res.status(404).json({
        errorMessage: 'Permission not found'
      });
    }

    // Prepare update data
    const updateData = {};

    // Handle name update if provided
    if (name) {
      // Check if name is already taken by another permission
      if (name !== existingPermission.name) {
        const nameExists = await prisma.permission.findFirst({
          where: {
            name: {
              equals: name,
              mode: 'insensitive'
            },
            id: { not: existingPermission.id },
            trash: false
          }
        });

        if (nameExists) {
          return res.status(400).json({
            errorMessage: 'Permission with this name already exists'
          });
        }

        // Generate new slug
        const slug = slugify(name, {
          lower: true,
          strict: true
        });

        // Check if slug is already taken
        const slugExists = await prisma.permission.findFirst({
          where: {
            slug,
            id: { not: existingPermission.id },
            trash: false
          }
        });

        if (slugExists) {
          return res.status(400).json({
            errorMessage: 'Permission with this slug already exists'
          });
        }

        // Add name and slug to update data
        updateData.name = name;
        updateData.slug = slug;
      }
    }

    // Handle status update if provided
    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    // Update permission in database
    const updatedPermission = await prisma.permission.update({
      where: { id: existingPermission.id },
      data: updateData
    });

    // Return response
    return res.status(200).json({
      message: 'Permission updated successfully',
      data: updatedPermission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      errorMessage: 'Error updating permission',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a permission (soft delete)
 * @ROUTE DELETE /api/v1/permissions/:idOrSlug
 * @ACCESS Private/Admin
 */
export const deletePermission = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if permission exists
    const permission = await prisma.permission.findFirst({
      where: query
    });

    if (!permission) {
      return res.status(404).json({
        errorMessage: 'Permission not found'
      });
    }

    // Check if permission is used in any roles
    // This would require a more complex query that's not directly supported by Prisma
    // You might need to implement this check based on your application's logic

    // Soft delete the permission
    const updatedPermission = await prisma.permission.update({
      where: { id: permission.id },
      data: { trash: true }
    });

    // Return response
    return res.status(200).json({
      message: 'Permission deleted successfully',
      data: updatedPermission
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting permission',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a permission
 * @ROUTE DELETE /api/v1/permissions/:idOrSlug/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeletePermission = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if permission exists
    const permission = await prisma.permission.findFirst({
      where: query
    });

    if (!permission) {
      return res.status(404).json({
        errorMessage: 'Permission not found'
      });
    }

    // Check if permission is used in any roles
    // This would require a more complex query that's not directly supported by Prisma
    // You might need to implement this check based on your application's logic

    // Permanently delete the permission
    await prisma.permission.delete({
      where: { id: permission.id }
    });

    // Return response
    return res.status(200).json({
      message: 'Permission permanently deleted',
      data: permission
    });
  } catch (error) {
    console.error('Error permanently deleting permission:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting permission',
      error: error.message
    });
  }
});
