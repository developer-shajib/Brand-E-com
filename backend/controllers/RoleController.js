import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';

/**
 * @DESC Fetch all roles with filtering, sorting and pagination
 * @ROUTE GET /api/v1/roles
 * @ACCESS Private/Admin
 */
export const fetchAllRoles = asyncHandler(async (req, res) => {
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
    const totalRoles = await prisma.role.count({
      where: filter
    });

    // Execute main query with pagination
    const roles = await prisma.role.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    // Format roles to include user count and format permissions
    const formattedRoles = roles.map((role) => {
      const { _count, ...roleData } = role;
      return {
        ...roleData,
        userCount: _count.users
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalRoles / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Roles fetched successfully',
      data: formattedRoles,
      pagination: {
        totalRoles,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching roles',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single role by ID or slug
 * @ROUTE GET /api/v1/roles/:idOrSlug
 * @ACCESS Private/Admin
 */
export const fetchSingleRole = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the role with user count and permissions
    const role = await prisma.role.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            users: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          },
          take: 10 // Limit to 10 users
        }
      }
    });

    // Check if role exists
    if (!role) {
      return res.status(404).json({
        errorMessage: 'Role not found'
      });
    }

    // Fetch permissions if role has any
    let permissions = [];
    if (role.permissions && role.permissions.length > 0) {
      permissions = await prisma.permission.findMany({
        where: {
          id: {
            in: role.permissions
          },
          trash: false
        }
      });
    }

    // Format response
    const { _count, ...roleData } = role;
    const formattedRole = {
      ...roleData,
      userCount: _count.users,
      permissions
    };

    // Return response
    return res.status(200).json({
      message: 'Role fetched successfully',
      data: formattedRole
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching role',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new role
 * @ROUTE POST /api/v1/roles
 * @ACCESS Private/Admin
 */
export const createRole = asyncHandler(async (req, res) => {
  try {
    const { name, permissions = [], status = true } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Role name is required'
      });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        trash: false
      }
    });

    if (existingRole) {
      return res.status(400).json({
        errorMessage: 'Role with this name already exists'
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if slug already exists
    const existingSlug = await prisma.role.findFirst({
      where: {
        slug,
        trash: false
      }
    });

    if (existingSlug) {
      return res.status(400).json({
        errorMessage: 'Role with this slug already exists'
      });
    }

    // Validate permissions if provided
    if (permissions.length > 0) {
      // Check if all permissions exist
      const permissionCount = await prisma.permission.count({
        where: {
          id: {
            in: permissions
          },
          trash: false
        }
      });

      if (permissionCount !== permissions.length) {
        return res.status(400).json({
          errorMessage: 'One or more permissions do not exist'
        });
      }
    }

    // Create role in database
    const newRole = await prisma.role.create({
      data: {
        name,
        slug,
        permissions,
        status: Boolean(status)
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      errorMessage: 'Error creating role',
      error: error.message
    });
  }
});

/**
 * @DESC Update a role
 * @ROUTE PUT /api/v1/roles/:idOrSlug
 * @ACCESS Private/Admin
 */
export const updateRole = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { name, permissions, status } = req.body;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Validate input
    if (!name && permissions === undefined && status === undefined) {
      return res.status(400).json({
        errorMessage: 'At least one field (name, permissions, or status) is required for update'
      });
    }

    // Check if role exists
    const existingRole = await prisma.role.findFirst({
      where: query
    });

    if (!existingRole) {
      return res.status(404).json({
        errorMessage: 'Role not found'
      });
    }

    // Prepare update data
    const updateData = {};

    // Handle name update if provided
    if (name) {
      // Check if name is already taken by another role
      if (name !== existingRole.name) {
        const nameExists = await prisma.role.findFirst({
          where: {
            name: {
              equals: name,
              mode: 'insensitive'
            },
            id: { not: existingRole.id },
            trash: false
          }
        });

        if (nameExists) {
          return res.status(400).json({
            errorMessage: 'Role with this name already exists'
          });
        }

        // Generate new slug
        const slug = slugify(name, {
          lower: true,
          strict: true
        });

        // Check if slug is already taken
        const slugExists = await prisma.role.findFirst({
          where: {
            slug,
            id: { not: existingRole.id },
            trash: false
          }
        });

        if (slugExists) {
          return res.status(400).json({
            errorMessage: 'Role with this slug already exists'
          });
        }

        // Add name and slug to update data
        updateData.name = name;
        updateData.slug = slug;
      }
    }

    // Handle permissions update if provided
    if (permissions !== undefined) {
      // Validate permissions
      if (permissions.length > 0) {
        // Check if all permissions exist
        const permissionCount = await prisma.permission.count({
          where: {
            id: {
              in: permissions
            },
            trash: false
          }
        });

        if (permissionCount !== permissions.length) {
          return res.status(400).json({
            errorMessage: 'One or more permissions do not exist'
          });
        }
      }

      updateData.permissions = permissions;
    }

    // Handle status update if provided
    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    // Update role in database
    const updatedRole = await prisma.role.update({
      where: { id: existingRole.id },
      data: updateData
    });

    // Return response
    return res.status(200).json({
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      errorMessage: 'Error updating role',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a role (soft delete)
 * @ROUTE DELETE /api/v1/roles/:idOrSlug
 * @ACCESS Private/Admin
 */
export const deleteRole = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if role exists
    const role = await prisma.role.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        errorMessage: 'Role not found'
      });
    }

    // Check if role has associated users
    if (role._count.users > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete role with ${role._count.users} associated users. Please reassign users to another role first.`
      });
    }

    // Soft delete the role
    const updatedRole = await prisma.role.update({
      where: { id: role.id },
      data: { trash: true }
    });

    // Return response
    return res.status(200).json({
      message: 'Role deleted successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting role',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a role
 * @ROUTE DELETE /api/v1/roles/:idOrSlug/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteRole = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if role exists
    const role = await prisma.role.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        errorMessage: 'Role not found'
      });
    }

    // Check if role has associated users
    if (role._count.users > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete role with ${role._count.users} associated users. Please reassign users to another role first.`
      });
    }

    // Permanently delete the role
    await prisma.role.delete({
      where: { id: role.id }
    });

    // Return response
    return res.status(200).json({
      message: 'Role permanently deleted',
      data: role
    });
  } catch (error) {
    console.error('Error permanently deleting role:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting role',
      error: error.message
    });
  }
});

/**
 * @DESC Assign permissions to a role
 * @ROUTE POST /api/v1/roles/:idOrSlug/permissions
 * @ACCESS Private/Admin
 */
export const assignPermissions = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { permissions } = req.body;

    // Validate input
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        errorMessage: 'Permissions array is required'
      });
    }

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if role exists
    const role = await prisma.role.findFirst({
      where: query
    });

    if (!role) {
      return res.status(404).json({
        errorMessage: 'Role not found'
      });
    }

    // Validate permissions
    const permissionCount = await prisma.permission.count({
      where: {
        id: {
          in: permissions
        },
        trash: false
      }
    });

    if (permissionCount !== permissions.length) {
      return res.status(400).json({
        errorMessage: 'One or more permissions do not exist'
      });
    }

    // Update role with new permissions
    const updatedRole = await prisma.role.update({
      where: { id: role.id },
      data: { permissions }
    });

    // Return response
    return res.status(200).json({
      message: 'Permissions assigned successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error assigning permissions:', error);
    return res.status(500).json({
      errorMessage: 'Error assigning permissions',
      error: error.message
    });
  }
});
