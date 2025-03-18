import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';

/**
 * @DESC Fetch all reviews with filtering, sorting and pagination
 * @ROUTE GET /api/v1/reviews
 * @ACCESS Public
 */
export const fetchAllReviews = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', productId, userId, rating, minRating, maxRating } = req.query;

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

    // Add productId filter if provided
    if (productId) {
      filter.productId = productId;
    }

    // Add userId filter if provided
    if (userId) {
      filter.userId = userId;
    }

    // Add rating filter if provided
    if (rating) {
      filter.rating = parseInt(rating, 10);
    }

    // Add rating range filter if provided
    if (minRating || maxRating) {
      filter.rating = {};

      if (minRating) {
        filter.rating.gte = parseInt(minRating, 10);
      }

      if (maxRating) {
        filter.rating.lte = parseInt(maxRating, 10);
      }
    }

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Execute count query for total
    const totalReviews = await prisma.review.count({
      where: filter
    });

    // Execute main query with pagination
    const reviews = await prisma.review.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            productSimple: {
              select: {
                productPhotos: true
              }
            },
            productVariable: {
              select: {
                productPhotos: true
              }
            }
          }
        }
      }
    });

    // Format reviews to include user and product details
    const formattedReviews = reviews.map((review) => {
      const { user, product, ...reviewData } = review;

      // Get product photo (first one) from either simple or variable product
      let productPhoto = null;
      if (product.productSimple && product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0) {
        productPhoto = product.productSimple.productPhotos[0];
      } else if (product.productVariable && product.productVariable.length > 0 && product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0) {
        productPhoto = product.productVariable[0].productPhotos[0];
      }

      return {
        ...reviewData,
        user: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage
        },
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          productPhoto
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Reviews fetched successfully',
      data: formattedReviews,
      pagination: {
        totalReviews,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching reviews',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch reviews for a specific product
 * @ROUTE GET /api/v1/reviews/product/:productId
 * @ACCESS Public
 */
export const fetchProductReviews = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Build filter object
    const filter = {
      productId,
      trash: false
    };

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Get review statistics
    const reviewStats = await prisma.$queryRaw`
      SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalReviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStarCount,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStarCount,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStarCount,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStarCount,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStarCount
      FROM "Review"
      WHERE "productId" = ${productId} AND trash = false
    `;

    // Execute count query for total
    const totalReviews = await prisma.review.count({
      where: filter
    });

    // Execute main query with pagination
    const reviews = await prisma.review.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Format reviews to include user details
    const formattedReviews = reviews.map((review) => {
      const { user, ...reviewData } = review;
      return {
        ...reviewData,
        user: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Format review statistics
    const stats = reviewStats[0]
      ? {
          averageRating: parseFloat(reviewStats[0].averageRating) || 0,
          totalReviews: parseInt(reviewStats[0].totalReviews) || 0,
          ratingDistribution: {
            5: parseInt(reviewStats[0].fiveStarCount) || 0,
            4: parseInt(reviewStats[0].fourStarCount) || 0,
            3: parseInt(reviewStats[0].threeStarCount) || 0,
            2: parseInt(reviewStats[0].twoStarCount) || 0,
            1: parseInt(reviewStats[0].oneStarCount) || 0
          }
        }
      : {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

    // Return response
    return res.status(200).json({
      message: 'Product reviews fetched successfully',
      data: {
        reviews: formattedReviews,
        stats
      },
      pagination: {
        totalReviews,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching product reviews',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch reviews by a specific user
 * @ROUTE GET /api/v1/reviews/user/:userId
 * @ACCESS Private
 */
export const fetchUserReviews = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        errorMessage: 'User not found'
      });
    }

    // Check if the requesting user is authorized to view these reviews
    // Only allow users to view their own reviews unless they're an admin
    if (req.user.id !== userId && req.user.userRole !== 'ADMIN') {
      return res.status(403).json({
        errorMessage: 'Not authorized to view these reviews'
      });
    }

    // Build filter object
    const filter = {
      userId,
      trash: false
    };

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Execute count query for total
    const totalReviews = await prisma.review.count({
      where: filter
    });

    // Execute main query with pagination
    const reviews = await prisma.review.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            productSimple: {
              select: {
                productPhotos: true
              }
            },
            productVariable: {
              select: {
                productPhotos: true
              }
            }
          }
        }
      }
    });

    // Format reviews to include product details
    const formattedReviews = reviews.map((review) => {
      const { product, ...reviewData } = review;

      // Get product photo (first one) from either simple or variable product
      let productPhoto = null;
      if (product.productSimple && product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0) {
        productPhoto = product.productSimple.productPhotos[0];
      } else if (product.productVariable && product.productVariable.length > 0 && product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0) {
        productPhoto = product.productVariable[0].productPhotos[0];
      }

      return {
        ...reviewData,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          productPhoto
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'User reviews fetched successfully',
      data: formattedReviews,
      pagination: {
        totalReviews,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching user reviews',
      error: error.message
    });
  }
});

/**
 * @DESC Fetch a single review by ID
 * @ROUTE GET /api/v1/reviews/:id
 * @ACCESS Public
 */
export const fetchSingleReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the review
    const review = await prisma.review.findUnique({
      where: {
        id,
        trash: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            productSimple: {
              select: {
                productPhotos: true
              }
            },
            productVariable: {
              select: {
                productPhotos: true
              }
            }
          }
        }
      }
    });

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        errorMessage: 'Review not found'
      });
    }

    // Format review to include user and product details
    const { user, product, ...reviewData } = review;

    // Get product photo (first one) from either simple or variable product
    let productPhoto = null;
    if (product.productSimple && product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0) {
      productPhoto = product.productSimple.productPhotos[0];
    } else if (product.productVariable && product.productVariable.length > 0 && product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0) {
      productPhoto = product.productVariable[0].productPhotos[0];
    }

    const formattedReview = {
      ...reviewData,
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage
      },
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        productPhoto
      }
    };

    // Return response
    return res.status(200).json({
      message: 'Review fetched successfully',
      data: formattedReview
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching review',
      error: error.message
    });
  }
});

/**
 * @DESC Create a new review
 * @ROUTE POST /api/v1/reviews
 * @ACCESS Private
 */
export const createReview = asyncHandler(async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        errorMessage: 'Product ID is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        errorMessage: 'Rating is required and must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
        trash: false
      }
    });

    if (existingReview) {
      return res.status(400).json({
        errorMessage: 'You have already reviewed this product',
        reviewId: existingReview.id
      });
    }

    // Check if user has purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          orderStatus: {
            in: ['DELIVERED', 'COMPLETED']
          }
        }
      }
    });

    if (!hasPurchased) {
      return res.status(400).json({
        errorMessage: 'You can only review products you have purchased'
      });
    }

    // Create review in database
    const newReview = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Format the response
    const { user, ...reviewData } = newReview;
    const formattedReview = {
      ...reviewData,
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage
      }
    };

    // Return response
    return res.status(201).json({
      message: 'Review created successfully',
      data: formattedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      errorMessage: 'Error creating review',
      error: error.message
    });
  }
});

/**
 * @DESC Update a review
 * @ROUTE PUT /api/v1/reviews/:id
 * @ACCESS Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating && !comment) {
      return res.status(400).json({
        errorMessage: 'At least one field (rating or comment) is required for update'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        errorMessage: 'Rating must be between 1 and 5'
      });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        errorMessage: 'Review not found'
      });
    }

    // Check if user is authorized to update this review
    if (review.userId !== userId && req.user.userRole !== 'ADMIN') {
      return res.status(403).json({
        errorMessage: 'Not authorized to update this review'
      });
    }

    // Prepare update data
    const updateData = {};
    if (rating) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    // Update review in database
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Format the response
    const { user, product, ...reviewData } = updatedReview;
    const formattedReview = {
      ...reviewData,
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage
      },
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug
      }
    };

    // Return response
    return res.status(200).json({
      message: 'Review updated successfully',
      data: formattedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      errorMessage: 'Error updating review',
      error: error.message
    });
  }
});

/**
 * @DESC Delete a review (soft delete)
 * @ROUTE DELETE /api/v1/reviews/:id
 * @ACCESS Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        errorMessage: 'Review not found'
      });
    }

    // Check if user is authorized to delete this review
    if (review.userId !== userId && req.user.userRole !== 'ADMIN') {
      return res.status(403).json({
        errorMessage: 'Not authorized to delete this review'
      });
    }

    // Soft delete the review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { trash: true }
    });

    // Return response
    return res.status(200).json({
      message: 'Review deleted successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting review',
      error: error.message
    });
  }
});

/**
 * @DESC Permanently delete a review
 * @ROUTE DELETE /api/v1/reviews/:id/permanent-delete
 * @ACCESS Private/Admin
 */
export const permanentDeleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        errorMessage: 'Review not found'
      });
    }

    // Only admin can permanently delete reviews
    if (req.user.userRole !== 'ADMIN') {
      return res.status(403).json({
        errorMessage: 'Not authorized to permanently delete reviews'
      });
    }

    // Permanently delete the review
    await prisma.review.delete({
      where: { id }
    });

    // Return response
    return res.status(200).json({
      message: 'Review permanently deleted',
      data: review
    });
  } catch (error) {
    console.error('Error permanently deleting review:', error);
    return res.status(500).json({
      errorMessage: 'Error permanently deleting review',
      error: error.message
    });
  }
});

/**
 * @DESC Get review statistics for a product
 * @ROUTE GET /api/v1/reviews/stats/:productId
 * @ACCESS Public
 */
export const getReviewStats = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found'
      });
    }

    // Get review statistics
    const reviewStats = await prisma.$queryRaw`
      SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalReviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStarCount,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStarCount,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStarCount,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStarCount,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStarCount
      FROM "Review"
      WHERE "productId" = ${productId} AND trash = false
    `;

    // Format review statistics
    const stats = reviewStats[0]
      ? {
          averageRating: parseFloat(reviewStats[0].averageRating) || 0,
          totalReviews: parseInt(reviewStats[0].totalReviews) || 0,
          ratingDistribution: {
            5: parseInt(reviewStats[0].fiveStarCount) || 0,
            4: parseInt(reviewStats[0].fourStarCount) || 0,
            3: parseInt(reviewStats[0].threeStarCount) || 0,
            2: parseInt(reviewStats[0].twoStarCount) || 0,
            1: parseInt(reviewStats[0].oneStarCount) || 0
          }
        }
      : {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

    // Return response
    return res.status(200).json({
      message: 'Review statistics fetched successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching review statistics',
      error: error.message
    });
  }
});
