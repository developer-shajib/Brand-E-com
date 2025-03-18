import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';
import slugify from 'slugify';
import { ProductSize, ProductColor } from '@prisma/client';
import { cloudUpload, findCloudinaryPublicId, cloudDelete } from '../utils/cloudinary.js';

/**
 * @DESC Fetch all products with filtering, sorting and pagination
 * @ROUTE GET /api/v1/products
 * @ACCESS Public
 */
export const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', category, brand, tag, featured, minPrice, maxPrice, status = 'ACTIVE', productType } = req.query;

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
      trash: false,
      status: status === 'ALL' ? undefined : status
    };

    // Add search filter if provided
    if (search) {
      filter.OR = [{ name: { contains: search, mode: 'insensitive' } }, { shortDesc: { contains: search, mode: 'insensitive' } }];
    }

    // Add category filter if provided
    if (category) {
      filter.categoryId = category;
    }

    // Add brand filter if provided
    if (brand) {
      filter.brandId = brand;
    }

    // Add tag filter if provided
    if (tag) {
      const tagIds = Array.isArray(tag) ? tag : [tag];

      filter.tagIds = {
        hasSome: tagIds
      };
    }

    // Add featured filter if provided
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // Add product type filter if provided
    if (productType) {
      filter.productType = productType;
    }

    // Add price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      // For simple products
      const priceFilter = {};

      if (minPrice !== undefined) {
        priceFilter.gte = parseFloat(minPrice);
      }

      if (maxPrice !== undefined) {
        priceFilter.lte = parseFloat(maxPrice);
      }

      // Apply price filter to different product types
      filter.OR = [{ productSimple: { regularPrice: priceFilter } }, { productVariable: { some: { regularPrice: priceFilter } } }, { productGroup: { some: { regularPrice: priceFilter } } }, { productExternal: { regularPrice: priceFilter } }];
    }

    // Remove undefined filters
    Object.keys(filter).forEach((key) => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // Build sort object
    const sortField = sort === 'price' ? 'productSimple.regularPrice' : sort;
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sortField]: sortOrder
    };

    // Execute count query for total
    const totalProducts = await prisma.product.count({
      where: filter
    });

    // Execute main query with pagination
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: sortOptions,
      skip,
      take: limitNumber
    });

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      // Remove reviews array and add averageRating
      const { reviews, ...productWithoutReviews } = product;
      return {
        ...productWithoutReviews,
        averageRating,
        reviewCount: ratings.length
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Products fetched successfully',
      data: productsWithRating,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching products',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single product by ID or slug
 * @ROUTE GET /api/v1/products/:idOrSlug
 * @ACCESS Public
 */
export const fetchSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is an ID or slug
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Build the query based on whether it's an ID or slug
    const query = isId ? { id: idOrSlug } : { slug: idOrSlug };

    // Add non-trash filter
    query.trash = false;

    // Fetch the product
    const product = await prisma.product.findFirst({
      where: query,
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Calculate average rating
    const ratings = product.reviews.map((review) => review.rating);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Add average rating to product
    const productWithRating = {
      ...product,
      averageRating,
      reviewCount: ratings.length
    };

    // Return response
    return res.status(200).json({
      message: 'Product fetched successfully',
      data: productWithRating
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching product',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch featured products
 * @ROUTE GET /api/v1/products/featured
 * @ACCESS Public
 */
export const fetchFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = parseInt(limit, 10);

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 20) {
      return res.status(400).json({
        errorMessage: 'Limit must be between 1 and 20'
      });
    }

    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
        trash: false,
        status: 'ACTIVE'
      },
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limitNumber
    });

    // Calculate average rating for each product
    const productsWithRating = featuredProducts.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      // Remove reviews array and add averageRating
      const { reviews, ...productWithoutReviews } = product;
      return {
        ...productWithoutReviews,
        averageRating,
        reviewCount: ratings.length
      };
    });

    // Return response
    return res.status(200).json({
      message: 'Featured products fetched successfully',
      data: productsWithRating
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching featured products',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch related products
 * @ROUTE GET /api/v1/products/:id/related
 * @ACCESS Public
 */
export const fetchRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    const limitNumber = parseInt(limit, 10);

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 12) {
      return res.status(400).json({
        errorMessage: 'Limit must be between 1 and 12'
      });
    }

    // Fetch the product to get its categories and tags
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        categoryId: true,
        tagIds: true,
        brandId: true
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Fetch related products based on categories, tags, or brand
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: id }, // Exclude the current product
        trash: false,
        status: 'ACTIVE',
        OR: [{ categoryId: product.categoryId }, { tagIds: { hasSome: product.tagIds } }, { brandId: product.brandId }]
      },
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limitNumber
    });

    // Calculate average rating for each product
    const productsWithRating = relatedProducts.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      // Remove reviews array and add averageRating
      const { reviews, ...productWithoutReviews } = product;
      return {
        ...productWithoutReviews,
        averageRating,
        reviewCount: ratings.length
      };
    });

    // Return response
    return res.status(200).json({
      message: 'Related products fetched successfully',
      data: productsWithRating
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching related products',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new product
 * @ROUTE POST /api/v1/products
 * @ACCESS Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      productType = 'SIMPLE',
      shortDesc,
      longDesc,
      specification,
      featured = false,
      status = 'ACTIVE',
      categoryId,
      tagIds,
      brandId,
      // Product type specific fields
      productSimple,
      productVariable = [],
      productGroup = [],
      productExternal = {
        regularPrice: 20.0,
        salePrice: 15.0,
        link: 'https://www.google.com',
        stock: 10
      }
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        errorMessage: 'Product name is required'
      });
    }

    // Check if product name already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name,
        trash: false
      }
    });

    if (existingProduct) {
      return res.status(400).json({
        errorMessage: 'Product with this name already exists'
      });
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true });

    // Validate product type specific data
    let productTypeData = {};
    switch (productType) {
      case 'SIMPLE':
        if (!productSimple?.regularPrice) {
          return res.status(400).json({
            errorMessage: 'Regular price is required for simple products'
          });
        }
        productTypeData.productSimple = {
          regularPrice: productSimple.regularPrice,
          salePrice: productSimple.salePrice,
          stock: productSimple.stock
        };
        break;

      case 'VARIABLE':
        if (!productVariable || !Array.isArray(productVariable) || productVariable.length === 0) {
          return res.status(400).json({
            errorMessage: 'At least one variation is required for variable products'
          });
        }

        // Validate each variation's size and color
        for (const variation of productVariable) {
          if (!variation.size || !variation.color) {
            return res.status(400).json({
              errorMessage: 'Size and color are required for each variation'
            });
          }

          // Validate size enum value
          if (!Object.values(ProductSize).includes(variation.size)) {
            return res.status(400).json({
              errorMessage: `Invalid size value. Must be one of: ${Object.values(ProductSize).join(', ')}`
            });
          }

          // Validate color enum value
          if (!Object.values(ProductColor).includes(variation.color)) {
            return res.status(400).json({
              errorMessage: `Invalid color value. Must be one of: ${Object.values(ProductColor).join(', ')}`
            });
          }
        }

        // Check for duplicate size/color combinations
        const combinations = new Set();
        for (const variation of productVariable) {
          const combo = `${variation.size}-${variation.color}`;
          if (combinations.has(combo)) {
            return res.status(400).json({
              errorMessage: 'Duplicate size and color combination found'
            });
          }
          combinations.add(combo);
        }

        // Check if regularPrice is provided for each variation
        for (const variation of productVariable) {
          if (!variation.regularPrice) {
            return res.status(400).json({
              errorMessage: 'Regular price is required for each variation'
            });
          }
        }

        productTypeData.productVariable = [...productVariable];
        break;

      case 'GROUP':
        if (!productGroup || !Array.isArray(productGroup) || productGroup.length === 0) {
          return res.status(400).json({
            errorMessage: 'At least one group item is required for group products'
          });
        }

        // check here if regularPrice and name is provided for each group item
        for (const item of productGroup) {
          if (!item.name) {
            return res.status(400).json({
              errorMessage: 'Group item name is required'
            });
          }
          if (!item.regularPrice) {
            return res.status(400).json({
              errorMessage: 'Regular price is required for each group item'
            });
          }
        }
        productTypeData.productGroup = [...productGroup];

        break;

      case 'EXTERNAL':
        // Check regular price and link is provided for external product
        if (!productExternal?.regularPrice || !productExternal?.link) {
          return res.status(400).json({
            errorMessage: 'Regular price and external link are required for external products'
          });
        }

        productTypeData.productExternal = {
          ...productExternal
        };
        break;

      default:
        return res.status(400).json({
          errorMessage: 'Invalid product type'
        });
    }

    let tagIdsArray = [];
    // Check tagIds value is array or not
    if (!Array.isArray(tagIds)) {
      tagIdsArray.push(tagIds);
    } else {
      tagIdsArray = tagIds;
    }

    let featuredBoolean = featured === 'true' || featured === true ? true : false;

    // Check productType and upload images for Simple product
    if (productType === 'SIMPLE' && req.files) {
      productTypeData.productSimple = {
        ...productTypeData.productSimple,
        productPhotos: []
      };

      for (let i = 0; i < req.files.length; i++) {
        await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
          .then((res) => {
            productTypeData.productSimple.productPhotos.push(res?.secure_url);
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    }

    // Check productType and upload images for Variable product
    if (productType === 'VARIABLE' && req.files) {
      productTypeData.productVariable = productTypeData.productVariable.map((variation) => ({
        ...variation,
        productPhotos: []
      }));

      for (let i = 0; i < req.files.length; i++) {
        await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
          .then((res) => {
            // now req.secure_url push to every productVariable index
            productTypeData.productVariable.forEach((variation) => {
              variation.productPhotos.push(res?.secure_url);
            });
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    }

    // Check productType and upload images for Group product
    if (productType === 'GROUP' && req.files) {
      productTypeData.productGroup = productTypeData.productGroup.map((item) => ({
        ...item,
        productPhotos: []
      }));

      for (let i = 0; i < req.files.length; i++) {
        await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
          .then((res) => {
            // now req.secure_url push to every productGroup index
            productTypeData.productGroup.forEach((item) => {
              item.productPhotos.push(res?.secure_url);
            });
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    }

    // Check productType and upload images for External product
    if (productType === 'EXTERNAL' && req.files) {
      productTypeData.productExternal = {
        ...productTypeData.productExternal,
        productPhotos: []
      };
      for (let i = 0; i < req.files.length; i++) {
        await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
          .then((res) => {
            productTypeData.productExternal.productPhotos.push(res?.secure_url);
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    }

    // Create product data object
    const productData = {
      name,
      slug,
      productType,
      shortDesc,
      longDesc,
      specification,
      featured: featuredBoolean,
      status,
      categoryId: categoryId || null,
      tagIds: tagIdsArray,
      brandId: brandId || null,
      ...productTypeData
    };

    // Create product
    const product = await prisma.product.create({
      data: productData,
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      errorMessage: 'Error creating product',
      error: error.message
    });
  }
});

/**
 * @DESC Update a product
 * @ROUTE PUT /api/v1/products/:id
 * @ACCESS Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      shortDesc,
      longDesc,
      specification,
      featured,
      status,
      categoryId,
      tagIds,
      brandId,
      // Product type specific fields
      productSimple,
      productVariable = [],
      productGroup = [],
      productExternal,
      deleteImgUrlForSimpleAndExternal = []
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        trash: false
      },
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // If name is being updated, check for duplicates and generate new slug
    let slug;
    if (name && name !== existingProduct.name) {
      const duplicateName = await prisma.product.findFirst({
        where: {
          name,
          id: { not: id },
          trash: false
        }
      });

      if (duplicateName) {
        return res.status(400).json({
          errorMessage: 'Product with this name already exists'
        });
      }

      slug = slugify(name, { lower: true });
    }

    // Prepare update data based on product type
    let productTypeData = {};
    switch (existingProduct.productType) {
      case 'SIMPLE':
        productTypeData.productSimple = {
          ...existingProduct.productSimple,
          productPhotos: existingProduct.productSimple.productPhotos || []
        };

        if (productSimple) {
          productTypeData.productSimple = {
            ...productTypeData.productSimple,
            ...productSimple,
            productPhotos: existingProduct.productSimple.productPhotos || []
          };
        }

        if (deleteImgUrlForSimpleAndExternal && deleteImgUrlForSimpleAndExternal.length > 0) {
          const deletePhotoUrl = existingProduct.productSimple.productPhotos.filter((photo) => !deleteImgUrlForSimpleAndExternal.includes(photo));

          productTypeData.productSimple.productPhotos = deletePhotoUrl;

          // Delete existing images from Cloudinary
          for (const photo of deleteImgUrlForSimpleAndExternal) {
            const publicId = findCloudinaryPublicId(photo);
            if (publicId) {
              await cloudDelete(publicId);
            }
          }
        }

        // Handle new image uploads for simple product
        if (req.files && req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
              .then((res) => {
                productTypeData.productSimple.productPhotos.push(res?.secure_url);
              })
              .catch((error) => {
                console.log(error.message);
              });
          }
        }

        break;

      case 'VARIABLE':
        productTypeData.productVariable = productVariable;

        if (productVariable) {
          // Validate each variation's size and color
          for (const variation of productVariable) {
            if (!variation.size || !variation.color) {
              return res.status(400).json({
                errorMessage: 'Size and color are required for each variation'
              });
            }

            // Validate size enum value
            if (!Object.values(ProductSize).includes(variation.size)) {
              return res.status(400).json({
                errorMessage: `Invalid size value. Must be one of: ${Object.values(ProductSize).join(', ')}`
              });
            }

            // Validate color enum value
            if (!Object.values(ProductColor).includes(variation.color)) {
              return res.status(400).json({
                errorMessage: `Invalid color value. Must be one of: ${Object.values(ProductColor).join(', ')}`
              });
            }
          }

          // Check for duplicate size/color combinations
          const combinations = new Set();
          for (const variation of productVariable) {
            const combo = `${variation.size}-${variation.color}`;
            if (combinations.has(combo)) {
              return res.status(400).json({
                errorMessage: 'Duplicate size and color combination found'
              });
            }
            combinations.add(combo);
          }

          // Delete images which productVariables productPhotos is not exist in existingProduct variable under productImages.

          const deletePhotoUrl = existingProduct.productVariable[0].productPhotos.filter((photo) => !productVariable[0].productPhotos.includes(photo));

          // delete from cloudinary
          for (const photo of deletePhotoUrl) {
            const publicId = findCloudinaryPublicId(photo);
            if (publicId) {
              await cloudDelete(publicId);
            }
          }

          if (req.files && req.files.length > 0) {
            // Handle new image uploads for variable product
            for (let i = 0; i < req.files.length; i++) {
              await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
                .then((res) => {
                  // Add new photo to all variations
                  productVariable.forEach((variation) => {
                    variation.productPhotos.push(res?.secure_url);
                  });
                })
                .catch((error) => {
                  console.log(error.message);
                });
            }
          }
        }
        break;

      case 'GROUP':
        productTypeData.productGroup = productGroup;

        if (productGroup) {
          for (const item of productGroup) {
            if (!item.name || !item.regularPrice) {
              return res.status(400).json({
                errorMessage: 'Name and regular price are required'
              });
            }
          }
          // Delete images which productVariables productPhotos is not exist in existingProduct variable under productImages.

          const deletePhotoUrl = existingProduct.productGroup[0].productPhotos.filter((photo) => !productGroup[0]?.productPhotos.includes(photo));

          // delete from cloudinary
          for (const photo of deletePhotoUrl) {
            const publicId = findCloudinaryPublicId(photo);
            if (publicId) {
              await cloudDelete(publicId);
            }
          }

          if (req.files && req.files.length > 0) {
            // Handle new image uploads for group product
            for (let i = 0; i < req.files.length; i++) {
              await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
                .then((res) => {
                  // Add new photo to all variations
                  productGroup.forEach((item) => {
                    item.productPhotos.push(res?.secure_url);
                  });
                })
                .catch((error) => {
                  console.log(error.message);
                });
            }
          }
        }
        break;

      case 'EXTERNAL':
        productTypeData.productExternal = {
          ...existingProduct.productExternal
        };

        if (productExternal) {
          // Check validation for regularPrice,link,salePrice,stock
          if (!productExternal.regularPrice || !productExternal.link) {
            return res.status(400).json({
              errorMessage: 'Regular price and link are required'
            });
          }

          productTypeData.productExternal = {
            ...productTypeData.productExternal,
            ...productExternal,
            productPhotos: existingProduct.productExternal.productPhotos || []
          };
        }

        if (deleteImgUrlForSimpleAndExternal && deleteImgUrlForSimpleAndExternal.length > 0) {
          const deletePhotoUrl = existingProduct.productExternal.productPhotos.filter((photo) => !deleteImgUrlForSimpleAndExternal.includes(photo));

          productTypeData.productExternal.productPhotos = deletePhotoUrl;

          // Delete existing images from Cloudinary
          for (const photo of deleteImgUrlForSimpleAndExternal) {
            const publicId = findCloudinaryPublicId(photo);
            if (publicId) {
              await cloudDelete(publicId);
            }
          }
        }

        // Handle new image uploads for simple product
        if (req.files && req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            await cloudUpload(req.files[i].path, `${process.env.CLOUDINARY_FOLDER_NAME}/products`)
              .then((res) => {
                productTypeData.productExternal.productPhotos.push(res?.secure_url);
              })
              .catch((error) => {
                console.log(error.message);
              });
          }
        }

        break;
    }

    const featuredBoolean = featured === 'true' ? true : false;

    let tagIdsArray = existingProduct.tags;

    if (tagIds) {
      tagIdsArray = !Array.isArray(tagIds) ? [tagIds] : tagIds;
    }

    // Create the update data object
    const updateData = {};

    // Only add fields that are provided and valid
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
    if (longDesc !== undefined) updateData.longDesc = longDesc;
    if (specification !== undefined) updateData.specification = specification;
    if (featured !== undefined) updateData.featured = featuredBoolean;
    if (status) updateData.status = status;

    updateData.categoryId = categoryId ? categoryId : existingProduct.categoryId;

    if (tagIds) updateData.tagIds = tagIdsArray;
    if (brandId !== undefined) updateData.brandId = brandId || null;

    // Merge product type data
    if (existingProduct.productType === 'SIMPLE') {
      updateData.productSimple = { ...productTypeData.productSimple };
    }
    if (existingProduct.productType === 'VARIABLE') {
      updateData.productVariable = [...productTypeData.productVariable];
    }
    if (existingProduct.productType === 'GROUP') {
      updateData.productGroup = [...productTypeData.productGroup];
    }
    if (existingProduct.productType === 'EXTERNAL') {
      updateData.productExternal = { ...productTypeData.productExternal };
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      errorMessage: 'Error updating product',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a product (soft delete)
 * @ROUTE DELETE /api/v1/products/:id
 * @ACCESS Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Soft delete product
    const deletedProduct = await prisma.product.update({
      where: { id },
      data: {
        trash: true,
        status: 'INACTIVE'
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting product',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a product
 * @ROUTE DELETE /api/v1/products/:id/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { id },
      include: {
        productSimple: true,
        productVariable: true,
        productGroup: true,
        productExternal: true
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Delete images from Cloudinary based on product type
    try {
      switch (product.productType) {
        case 'SIMPLE':
          if (product.productSimple?.productPhotos) {
            for (const photo of product.productSimple.productPhotos) {
              // Extract public_id from the URL
              const publicId = findCloudinaryPublicId(photo);
              await cloudDelete(publicId);
            }
          }
          break;

        case 'VARIABLE':
          if (product.productVariable) {
            for (const variation of product.productVariable) {
              if (variation.productPhotos) {
                for (const photo of variation.productPhotos) {
                  const publicId = findCloudinaryPublicId(photo);
                  await cloudDelete(publicId);
                }
              }
            }
          }
          break;

        case 'GROUP':
          if (product.productGroup) {
            for (const item of product.productGroup) {
              if (item.productPhotos) {
                for (const photo of item.productPhotos) {
                  const publicId = findCloudinaryPublicId(photo);
                  await cloudDelete(publicId);
                }
              }
            }
          }
          break;

        case 'EXTERNAL':
          if (product.productExternal?.productPhotos) {
            for (const photo of product.productExternal.productPhotos) {
              const publicId = findCloudinaryPublicId(photo);
              await cloudDelete(publicId);
            }
          }
          break;
      }
    } catch (cloudinaryError) {
      console.error('Error deleting images from Cloudinary:', cloudinaryError);
      // Continue with product deletion even if image deletion fails
    }

    // Delete product and all related data
    await prisma.product.delete({
      where: { id }
    });

    // Return response
    return res.status(200).json({
      message: 'Product permanently deleted',
      data: product
    });
  } catch (error) {
    console.error('Error permanently deleting product:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting product',
      error: error.message
    });
  }
});

/**
 * @DESC Update product status
 * @ROUTE PATCH /api/v1/products/:id/status
 * @ACCESS Private/Admin
 */
export const updateProductStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['ACTIVE', 'INACTIVE', 'DRAFT', 'OUT_OF_STOCK'].includes(status)) {
      return res.status(400).json({
        errorMessage: 'Invalid status value'
      });
    }

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status }
    });

    // Return response
    return res.status(200).json({
      message: 'Product status updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({
      errorMessage: 'Error updating product status',
      error: error.message
    });
  }
});

/**
 * @DESC Toggle product featured status
 * @ROUTE PATCH /api/v1/products/:id/featured
 * @ACCESS Private/Admin
 */
export const toggleProductFeatured = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Toggle featured status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        featured: !product.featured
      }
    });

    // Return response
    return res.status(200).json({
      message: `Product ${updatedProduct.featured ? 'marked as featured' : 'removed from featured'}`,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error toggling product featured status:', error);
    return res.status(500).json({
      errorMessage: 'Error toggling product featured status',
      error: error.message
    });
  }
});
