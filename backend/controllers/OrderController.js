import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';

/**
 * @DESC Create a new order from cart
 * @ROUTE POST /api/v1/orders
 * @ACCESS Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, billingAddress, paymentMethod = 'CASH_ON_DELIVERY', notes } = req.body;

    // Validate input
    if (!shippingAddress) {
      return res.status(400).json({
        errorMessage: 'Shipping address is required'
      });
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
        trash: false
      },
      include: {
        items: {
          where: {
            trash: false
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productType: true,
                productSimple: true,
                productVariable: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Check if cart exists and has items
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        errorMessage: 'Your cart is empty'
      });
    }

    // Validate products availability and calculate total
    let totalAmount = 0;
    const orderItems = [];
    const stockUpdates = [];
    const unavailableItems = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if product is still active
      if (product.status !== 'ACTIVE') {
        unavailableItems.push({
          productId: product.id,
          name: product.name,
          reason: 'Product is no longer available'
        });
        continue;
      }

      // Get product details based on type
      let productPrice = item.price;
      let productImage = null;
      let currentStock = null;

      if (product.productType === 'SIMPLE' && product.productSimple) {
        productPrice = product.productSimple.salePrice || product.productSimple.regularPrice;
        productImage = product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0 ? product.productSimple.productPhotos[0] : null;
        currentStock = product.productSimple.stock;
      } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0) {
        productPrice = product.productVariable[0].salePrice || product.productVariable[0].regularPrice;
        productImage = product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0 ? product.productVariable[0].productPhotos[0] : null;
        currentStock = product.productVariable[0].stock;
      } else {
        unavailableItems.push({
          productId: product.id,
          name: product.name,
          reason: 'Product type not supported'
        });
        continue;
      }

      // Check stock availability
      if (currentStock !== null && currentStock < item.quantity) {
        unavailableItems.push({
          productId: product.id,
          name: product.name,
          reason: currentStock === 0 ? 'Product is out of stock' : `Only ${currentStock} items available in stock`
        });
        continue;
      }

      // Calculate item total
      const itemTotal = productPrice * item.quantity;
      totalAmount += itemTotal;

      // Add to order items
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice,
        productImage,
        quantity: item.quantity,
        price: itemTotal
      });

      // Prepare stock update if needed
      if (currentStock !== null) {
        if (product.productType === 'SIMPLE') {
          stockUpdates.push({
            id: product.id,
            productSimple: {
              stock: currentStock - item.quantity
            }
          });
        } else if (product.productType === 'VARIABLE') {
          // This is simplified - in a real app, you'd need to track which variation is being purchased
          stockUpdates.push({
            id: product.id,
            productVariable: {
              update: {
                where: {
                  // This is a placeholder - you'd need the actual ID of the variation
                  // For now, we're just updating the first variation
                  index: 0
                },
                data: {
                  stock: currentStock - item.quantity
                }
              }
            }
          });
        }
      }
    }

    // Check if any items are unavailable
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        errorMessage: 'Some items in your cart are unavailable',
        unavailableItems
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        notes,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: true
      }
    });

    // Update product stock
    for (const update of stockUpdates) {
      await prisma.product.update({
        where: { id: update.id },
        data: update.productType === 'SIMPLE' ? { productSimple: update.productSimple } : { productVariable: update.productVariable }
      });
    }

    // Clear cart after successful order
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        trash: false
      },
      data: {
        trash: true
      }
    });

    // Return response
    return res.status(201).json({
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      errorMessage: 'Error creating order',
      error: error.message
    });
  }
});

/**
 * @DESC Get all orders with filtering, sorting and pagination
 * @ROUTE GET /api/v1/orders
 * @ACCESS Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status, paymentStatus, paymentMethod, startDate, endDate, search } = req.query;

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
    if (status) {
      filter.orderStatus = status;
    }

    // Add payment status filter if provided
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Add payment method filter if provided
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        // Set time to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.lte = endDateTime;
      }
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [{ id: { contains: search } }, { trackingNumber: { contains: search, mode: 'insensitive' } }, { user: { name: { contains: search, mode: 'insensitive' } } }, { user: { email: { contains: search, mode: 'insensitive' } } }];
    }

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Execute count query for total
    const totalOrders = await prisma.order.count({
      where: filter
    });

    // Execute main query with pagination
    const orders = await prisma.order.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    // Format orders to include user details and item count
    const formattedOrders = orders.map((order) => {
      const { user, _count, ...orderData } = order;
      return {
        ...orderData,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone
            }
          : null,
        itemCount: _count.orderItems
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'Orders fetched successfully',
      data: formattedOrders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching orders',
      error: error.message
    });
  }
});

/**
 * @DESC Get user's orders
 * @ROUTE GET /api/v1/orders/my-orders
 * @ACCESS Private
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status } = req.query;

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
      userId,
      trash: false
    };

    // Add status filter if provided
    if (status) {
      filter.orderStatus = status;
    }

    // Build sort object
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortOptions = {
      [sort]: sortOrder
    };

    // Execute count query for total
    const totalOrders = await prisma.order.count({
      where: filter
    });

    // Execute main query with pagination
    const orders = await prisma.order.findMany({
      where: filter,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    // Format orders to include item count
    const formattedOrders = orders.map((order) => {
      const { _count, ...orderData } = order;
      return {
        ...orderData,
        itemCount: _count.orderItems
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Return response
    return res.status(200).json({
      message: 'User orders fetched successfully',
      data: formattedOrders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching user orders',
      error: error.message
    });
  }
});

/**
 * @DESC Get order by ID
 * @ROUTE GET /api/v1/orders/:id
 * @ACCESS Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.userRole === 'ADMIN';

    // Build query
    const query = {
      id,
      trash: false
    };

    // If not admin, restrict to user's own orders
    if (!isAdmin) {
      query.userId = userId;
    }

    // Find order
    const order = await prisma.order.findFirst({
      where: query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found'
      });
    }

    // Format order to include user details and items
    const { user, orderItems, ...orderData } = order;

    const formattedOrder = {
      ...orderData,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            postalCode: user.postalCode,
            country: user.country
          }
        : null,
      items: orderItems.map((item) => {
        const { product, ...itemData } = item;
        return {
          ...itemData,
          product: product
            ? {
                id: product.id,
                name: product.name,
                slug: product.slug
              }
            : null
        };
      })
    };

    // Return response
    return res.status(200).json({
      message: 'Order fetched successfully',
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching order',
      error: error.message
    });
  }
});

/**
 * @DESC Update order status
 * @ROUTE PATCH /api/v1/orders/:id/status
 * @ACCESS Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // Validate input
    if (!orderStatus) {
      return res.status(400).json({
        errorMessage: 'Order status is required'
      });
    }

    // Check if order exists
    const order = await prisma.order.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        orderStatus
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      errorMessage: 'Error updating order status',
      error: error.message
    });
  }
});

/**
 * @DESC Update payment status
 * @ROUTE PATCH /api/v1/orders/:id/payment
 * @ACCESS Private/Admin
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    // Validate input
    if (!paymentStatus) {
      return res.status(400).json({
        errorMessage: 'Payment status is required'
      });
    }

    // Check if order exists
    const order = await prisma.order.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found'
      });
    }

    // Update payment status
    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        paymentStatus
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Payment status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      errorMessage: 'Error updating payment status',
      error: error.message
    });
  }
});

/**
 * @DESC Add tracking number to order
 * @ROUTE PATCH /api/v1/orders/:id/tracking
 * @ACCESS Private/Admin
 */
export const addTrackingNumber = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    // Validate input
    if (!trackingNumber) {
      return res.status(400).json({
        errorMessage: 'Tracking number is required'
      });
    }

    // Check if order exists
    const order = await prisma.order.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found'
      });
    }

    // Update tracking number
    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        trackingNumber
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Tracking number added successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error adding tracking number:', error);
    return res.status(500).json({
      errorMessage: 'Error adding tracking number',
      error: error.message
    });
  }
});

/**
 * @DESC Cancel order
 * @ROUTE PATCH /api/v1/orders/:id/cancel
 * @ACCESS Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.userRole === 'ADMIN';

    // Build query
    const query = {
      id,
      trash: false
    };

    // If not admin, restrict to user's own orders
    if (!isAdmin) {
      query.userId = userId;

      // Users can only cancel orders in certain statuses
      query.orderStatus = {
        in: ['PENDING', 'PROCESSING']
      };
    }

    // Check if order exists
    const order = await prisma.order.findFirst({
      where: query,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found or cannot be cancelled'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        orderStatus: 'CANCELLED',
        paymentStatus: order.paymentStatus === 'COMPLETED' ? 'REFUNDED' : 'CANCELLED'
      }
    });

    // Restore stock for each item
    for (const item of order.orderItems) {
      if (item.product) {
        const product = item.product;

        if (product.productType === 'SIMPLE' && product.productSimple && product.productSimple.stock !== null) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              productSimple: {
                stock: product.productSimple.stock + item.quantity
              }
            }
          });
        } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0 && product.productVariable[0].stock !== null) {
          // This is simplified - in a real app, you'd need to track which variation was purchased
          await prisma.product.update({
            where: { id: product.id },
            data: {
              productVariable: {
                update: {
                  where: { index: 0 },
                  data: {
                    stock: product.productVariable[0].stock + item.quantity
                  }
                }
              }
            }
          });
        }
      }
    }

    // Return response
    return res.status(200).json({
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      errorMessage: 'Error cancelling order',
      error: error.message
    });
  }
});

/**
 * @DESC Delete order (soft delete)
 * @ROUTE DELETE /api/v1/orders/:id
 * @ACCESS Private/Admin
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await prisma.order.findFirst({
      where: {
        id,
        trash: false
      }
    });

    if (!order) {
      return res.status(404).json({
        errorMessage: 'Order not found'
      });
    }

    // Soft delete order
    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        trash: true
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Order deleted successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      errorMessage: 'Error deleting order',
      error: error.message
    });
  }
});

/**
 * @DESC Get order statistics
 * @ROUTE GET /api/v1/orders/stats
 * @ACCESS Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get current date
    const now = new Date();
    let startDate;

    // Calculate start date based on period
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const day = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: {
        trash: false
      }
    });

    // Get orders in period
    const ordersInPeriod = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate
        },
        trash: false
      }
    });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        trash: false,
        paymentStatus: 'COMPLETED'
      }
    });

    // Get revenue in period
    const revenueInPeriodResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: startDate
        },
        trash: false,
        paymentStatus: 'COMPLETED'
      }
    });

    // Get order status counts
    const statusCounts = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: true,
      where: {
        trash: false
      }
    });

    // Get payment status counts
    const paymentStatusCounts = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: true,
      where: {
        trash: false
      }
    });

    // Format status counts
    const formattedStatusCounts = {};
    statusCounts.forEach((item) => {
      formattedStatusCounts[item.orderStatus] = item._count;
    });

    // Format payment status counts
    const formattedPaymentStatusCounts = {};
    paymentStatusCounts.forEach((item) => {
      formattedPaymentStatusCounts[item.paymentStatus] = item._count;
    });

    // Return response
    return res.status(200).json({
      message: 'Order statistics fetched successfully',
      data: {
        totalOrders,
        ordersInPeriod,
        totalRevenue: revenueResult._sum.totalAmount || 0,
        revenueInPeriod: revenueInPeriodResult._sum.totalAmount || 0,
        orderStatusCounts: formattedStatusCounts,
        paymentStatusCounts: formattedPaymentStatusCounts,
        period
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching order statistics',
      error: error.message
    });
  }
});
