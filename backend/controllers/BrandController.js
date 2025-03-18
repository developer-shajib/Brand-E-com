import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';
import { cloudUpload, cloudDelete, findCloudinaryPublicId } from '../utils/cloudinary.js';

/**
 * @DESC Fetch all brands with filtering, sorting and pagination
 * @ROUTE GET /api/v1/brands
 * @ACCESS Public
 */
export const fetchAllBrands = asyncHandler(async (req, res) => {
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
    const totalBrands = await prisma.brand.count({
      where: filter
    });

    // Execute main query with pagination
    const brands = await prisma.brand.findMany({
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

    // Format brands to include product count
    const formattedBrands = brands.map((brand) => {
      const { _count, ...brandData } = brand;
      return {
        ...brandData,
        productCount: _count.products
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalBrands / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Brands fetched successfully',
      data: formattedBrands,
      pagination: {
        totalBrands,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching brands',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single brand by ID or slug
 * @ROUTE GET /api/v1/brands/:idOrSlug
 * @ACCESS Public
 */
export const fetchSingleBrand = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the brand with product count
    const brand = await prisma.brand.findFirst({
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

    // Check if brand exists
    if (!brand) {
      return res.status(404).json({
        errorMessage: 'Brand not found'
      });
    }

    // Format response
    const { _count, ...brandData } = brand;
    const formattedBrand = {
      ...brandData,
      productCount: _count.products
    };

    // Return response
    return res.status(200).json({
      message: 'Brand fetched successfully',
      data: formattedBrand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching brand',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new brand
 * @ROUTE POST /api/v1/brands
 * @ACCESS Private/Admin
 */
export const createBrand = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Brand name is required'
      });
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        trash: false
      }
    });

    if (existingBrand) {
      return res.status(400).json({
        errorMessage: 'Brand with this name already exists'
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if slug already exists
    const existingSlug = await prisma.brand.findFirst({
      where: {
        slug,
        trash: false
      }
    });

    if (existingSlug) {
      return res.status(400).json({
        errorMessage: 'Brand with this slug already exists'
      });
    }

    // Upload logo to Cloudinary if provided
    let logoUrl = null;
    if (req.file) {
      try {
        const uploadResult = await cloudUpload(req.file.path, `${process.env.CLOUDINARY_FOLDER_NAME}/brands`);
        logoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading brand logo:', uploadError);
        return res.status(400).json({
          errorMessage: `Failed to upload brand logo: ${uploadError.message}`
        });
      }
    }

    // Create brand in database
    const newBrand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo: logoUrl
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Brand created successfully',
      data: newBrand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    return res.status(500).json({
      errorMessage: 'Error creating brand',
      error: error.message
    });
  }
});

/**
 * @DESC Update a brand
 * @ROUTE PUT /api/v1/brands/:idOrSlug
 * @ACCESS Private/Admin
 */
export const updateBrand = asyncHandler(async (req, res) => {
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
        errorMessage: 'Brand name is required'
      });
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findFirst({
      where: query
    });

    if (!existingBrand) {
      return res.status(404).json({
        errorMessage: 'Brand not found'
      });
    }

    // Check if name is already taken by another brand
    if (name !== existingBrand.name) {
      const nameExists = await prisma.brand.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          id: { not: existingBrand.id },
          trash: false
        }
      });

      if (nameExists) {
        return res.status(400).json({
          errorMessage: 'Brand with this name already exists'
        });
      }
    }

    // Generate new slug if name changed
    let slug = existingBrand.slug;
    if (name !== existingBrand.name) {
      slug = slugify(name, {
        lower: true,
        strict: true
      });

      // Check if slug is already taken
      const slugExists = await prisma.brand.findFirst({
        where: {
          slug,
          id: { not: existingBrand.id },
          trash: false
        }
      });

      if (slugExists) {
        return res.status(400).json({
          errorMessage: 'Brand with this slug already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      slug
    };

    // Handle logo upload if provided
    if (req?.file) {
      try {
        // Upload new logo to Cloudinary
        const uploadResult = await cloudUpload(req.file.path, `${process.env.CLOUDINARY_FOLDER_NAME}/brands`);
        updateData.logo = uploadResult.secure_url;

        // Delete old logo if exists
        if (existingBrand.logo) {
          try {
            const publicId = findCloudinaryPublicId(existingBrand.logo);
            if (publicId) {
              await cloudDelete(publicId);
            }
          } catch (deleteError) {
            console.error('Error deleting old brand logo:', deleteError.message);
            // Continue with the update even if deletion fails
          }
        }
      } catch (uploadError) {
        console.error('Error uploading brand logo:', uploadError);
        return res.status(400).json({
          errorMessage: `Failed to upload brand logo: ${uploadError.message}`
        });
      }
    }

    // Update brand in database
    const updatedBrand = await prisma.brand.update({
      where: { id: existingBrand.id },
      data: updateData
    });

    // Return response
    return res.status(200).json({
      message: 'Brand updated successfully',
      data: updatedBrand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return res.status(500).json({
      errorMessage: 'Error updating brand',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a brand (soft delete)
 * @ROUTE DELETE /api/v1/brands/:idOrSlug
 * @ACCESS Private/Admin
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({
        errorMessage: 'Brand not found'
      });
    }

    // Check if brand has associated products
    if (brand._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete brand with ${brand._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Soft delete the brand
    await prisma.brand.update({
      where: query,
      data: { trash: true }
    });

    // Return response
    return res.status(200).json({
      message: 'Brand deleted successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting brand',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a brand
 * @ROUTE DELETE /api/v1/brands/:idOrSlug/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteBrand = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: query,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({
        errorMessage: 'Brand not found'
      });
    }

    // Check if brand has associated products
    if (brand._count.products > 0) {
      return res.status(400).json({
        errorMessage: `Cannot delete brand with ${brand._count.products} associated products. Please reassign or delete the products first.`
      });
    }

    // Delete logo from Cloudinary if exists
    if (brand.logo) {
      try {
        const publicId = findCloudinaryPublicId(brand.logo);
        if (publicId) {
          await cloudDelete(publicId);
        }
      } catch (deleteError) {
        console.error('Error deleting brand logo:', deleteError.message);
        // Continue with deletion even if logo deletion fails
      }
    }

    // Permanently delete the brand
    await prisma.brand.delete({
      where: query
    });

    // Return response
    return res.status(200).json({
      message: 'Brand permanently deleted',
      data: brand
    });
  } catch (error) {
    console.error('Error permanently deleting brand:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting brand',
      error: error.message
    });
  }
});
