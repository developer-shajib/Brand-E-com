import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';

/**
 * @DESC Fetch all tags with filtering, sorting and pagination
 * @ROUTE GET /api/v1/tags
 * @ACCESS Public
 */
export const fetchAllTags = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '' } = req.query;

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
    const totalTags = await prisma.tag.count({
      where: filter
    });

    // Execute main query with pagination
    const tags = await prisma.tag.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Format tags to include product count
    const formattedTags = tags.map((tag) => {
      const { _count, ...tagData } = tag;
      return {
        ...tagData,
        productCount: _count.products
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalTags / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Tags fetched successfully',
      data: formattedTags,
      pagination: {
        totalTags,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching tags',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single tag by ID or slug
 * @ROUTE GET /api/v1/tags/:idOrSlug
 * @ACCESS Public
 */
export const fetchSingleTag = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the tag with product count
    const tag = await prisma.tag.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        },
        products: {
          where: {
            trash: false,
            status: 'ACTIVE'
          },
          take: 10, // Limit to 10 products
          select: {
            id: true,
            name: true,
            slug: true,
            productSimple: true,
            productType: true
          }
        }
      }
    });

    // Check if tag exists
    if (!tag) {
      return res.status(404).json({
        errorMessage: 'Tag not found'
      });
    }

    // Format response
    const { _count, ...tagData } = tag;
    const formattedTag = {
      ...tagData,
      productCount: _count.products
    };

    // Return response
    return res.status(200).json({
      message: 'Tag fetched successfully',
      data: formattedTag
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching tag',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new tag
 * @ROUTE POST /api/v1/tag
 * @ACCESS Private/Admin
 */
export const createTag = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Tag name is required'
      });
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        trash: false
      }
    });

    if (existingTag) {
      return res.status(400).json({
        errorMessage: 'Tag with this name already exists'
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if slug already exists
    const existingSlug = await prisma.tag.findFirst({
      where: {
        slug,
        trash: false
      }
    });

    if (existingSlug) {
      return res.status(400).json({
        errorMessage: 'Tag with this slug already exists'
      });
    }

    // Create tag in database
    const newTag = await prisma.tag.create({
      data: {
        name,
        slug
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Tag created successfully',
      data: newTag
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return res.status(500).json({
      errorMessage: 'Error creating tag',
      error: error.message
    });
  }
});

/**
 * @DESC Update a tag
 * @ROUTE PUT /api/v1/tag/:idOrSlug
 * @ACCESS Private/Admin
 */
export const updateTag = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { name } = req.body;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Tag name is required'
      });
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findFirst({
      where: query
    });

    if (!existingTag) {
      return res.status(404).json({
        errorMessage: 'Tag not found'
      });
    }

    // Check if name is already taken by another tag
    if (name !== existingTag.name) {
      const nameExists = await prisma.tag.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          id: { not: existingTag.id },
          trash: false
        }
      });

      if (nameExists) {
        return res.status(400).json({
          errorMessage: 'Tag with this name already exists'
        });
      }
    }

    // Generate new slug if name changed
    let slug = existingTag.slug;
    if (name !== existingTag.name) {
      slug = slugify(name, {
        lower: true,
        strict: true
      });

      // Check if slug is already taken
      const slugExists = await prisma.tag.findFirst({
        where: {
          slug,
          id: { not: existingTag.id },
          trash: false
        }
      });

      if (slugExists) {
        return res.status(400).json({
          errorMessage: 'Tag with this slug already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      slug
    };

    // Update tag in database
    const updatedTag = await prisma.tag.update({
      where: { id: existingTag.id },
      data: updateData
    });

    // Return response
    return res.status(200).json({
      message: 'Tag updated successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return res.status(500).json({
      errorMessage: 'Error updating tag',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a tag (soft delete)
 * @ROUTE DELETE /api/v1/tag/:idOrSlug
 * @ACCESS Private/Admin
 */
export const deleteTag = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if tag exists
    const tag = await prisma.tag.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        errorMessage: 'Tag not found'
      });
    }

    // Check if tag has associated products
    if (tag._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete tag with ${tag._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Soft delete the tag
    const updatedTag = await prisma.tag.update({
      where: { id: tag.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      data: { trash: true }
    });

    // Return response
    return res.status(200).json({
      message: 'Tag deleted successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting tag',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a tag
 * @ROUTE DELETE /api/v1/tag/:idOrSlug/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteTag = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if tag exists
    const tag = await prisma.tag.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        errorMessage: 'Tag not found'
      });
    }

    // Check if tag has associated products
    if (tag._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete tag with ${tag._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Permanently delete the tag
    await prisma.tag.delete({
      where: { id: tag.id }
    });

    // Return response
    return res.status(200).json({
      message: 'Tag permanently deleted',
      data: tag
    });
  } catch (error) {
    console.error('Error permanently deleting tag:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting tag',
      error: error.message
    });
  }
});
