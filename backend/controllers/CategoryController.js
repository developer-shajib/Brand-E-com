import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';

/**
 * @DESC Fetch all categories with filtering, sorting and pagination
 * @ROUTE GET /api/v1/categories
 * @ACCESS Public
 */
export const fetchAllCategories = asyncHandler(async (req, res) => {
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
    const totalCategories = await prisma.category.count({
      where: filter
    });

    // Execute main query with pagination
    const categories = await prisma.category.findMany({
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

    // Format categories to include product count
    const formattedCategories = categories.map((category) => {
      const { _count, ...categoryData } = category;
      return {
        ...categoryData,
        productCount: _count.products
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCategories / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Categories fetched successfully',
      data: formattedCategories,
      pagination: {
        totalCategories,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching categories',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single category by ID or slug
 * @ROUTE GET /api/v1/categories/:idOrSlug
 * @ACCESS Public
 */
export const fetchSingleCategory = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the category with product count
    const category = await prisma.category.findFirst({
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

    // Check if category exists
    if (!category) {
      return res.status(404).json({
        errorMessage: 'Category not found'
      });
    }

    // Format response
    const { _count, ...categoryData } = category;
    const formattedCategory = {
      ...categoryData,
      productCount: _count.products
    };

    // Return response
    return res.status(200).json({
      message: 'Category fetched successfully',
      data: formattedCategory
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching category',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new category
 * @ROUTE POST /api/v1/categories
 * @ACCESS Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        trash: false
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        errorMessage: 'Category with this name already exists'
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if slug already exists
    const existingSlug = await prisma.category.findFirst({
      where: {
        slug,
        trash: false
      }
    });

    if (existingSlug) {
      return res.status(400).json({
        errorMessage: 'Category with this slug already exists'
      });
    }

    // Create category in database
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      errorMessage: 'Error creating category',
      error: error.message
    });
  }
});

/**
 * @DESC Update a category
 * @ROUTE PUT /api/v1/categories/:idOrSlug
 * @ACCESS Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
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
        errorMessage: 'Category name is required'
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
      where: query
    });

    if (!existingCategory) {
      return res.status(404).json({
        errorMessage: 'Category not found'
      });
    }

    // Check if name is already taken by another category
    if (name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          id: { not: existingCategory.id },
          trash: false
        }
      });

      if (nameExists) {
        return res.status(400).json({
          errorMessage: 'Category with this name already exists'
        });
      }
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      slug = slugify(name, {
        lower: true,
        strict: true
      });

      // Check if slug is already taken
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: existingCategory.id },
          trash: false
        }
      });

      if (slugExists) {
        return res.status(400).json({
          errorMessage: 'Category with this slug already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      slug
    };

    // Update category in database
    const updatedCategory = await prisma.category.update({
      where: { id: existingCategory.id },
      data: updateData
    });

    // Return response
    return res.status(200).json({
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      errorMessage: 'Error updating category',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a category (soft delete)
 * @ROUTE DELETE /api/v1/categories/:idOrSlug
 * @ACCESS Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if category exists
    const category = await prisma.category.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        errorMessage: 'Category not found'
      });
    }

    // Check if category has associated products
    if (category._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete category with ${category._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Soft delete the category
    const updateCategory = await prisma.category.update({
      where: { id: category.id },
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
      message: 'Category deleted successfully',
      data: updateCategory
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting category',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a category
 * @ROUTE DELETE /api/v1/categories/:idOrSlug/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteCategory = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if category exists
    const category = await prisma.category.findFirst({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        errorMessage: 'Category not found'
      });
    }

    // Check if category has associated products
    if (category._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete category with ${category._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Permanently delete the category
    await prisma.category.delete({
      where: { id: category.id }
    });

    // Return response
    return res.status(200).json({
      message: 'Category permanently deleted',
      data: category
    });
  } catch (error) {
    console.error('Error permanently deleting category:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting category',
      error: error.message
    });
  }
});
