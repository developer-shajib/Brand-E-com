import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma/index.js';

/**
 * @DESC Get user's cart with items
 * @ROUTE GET /api/v1/cart
 * @ACCESS Private
 */
export const getCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    let cart = await prisma.cart.findUnique({
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
                slug: true,
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

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId
        },
        include: {
          items: true
        }
      });
    }

    // Format cart items to include product details and calculate totals
    let subtotal = 0;
    const formattedItems = cart.items.map((item) => {
      const { product, ...itemData } = item;

      // Get product photo based on product type
      let productPhoto = null;
      let currentPrice = item.price;

      if (product.productType === 'SIMPLE' && product.productSimple) {
        productPhoto = product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0 ? product.productSimple.productPhotos[0] : null;

        currentPrice = product.productSimple.salePrice || product.productSimple.regularPrice;
      } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0) {
        productPhoto = product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0 ? product.productVariable[0].productPhotos[0] : null;
      } else if (product.productType === 'GROUP' && product.productGroup) {
        productPhoto = product.productGroup.productPhotos && product.productGroup.productPhotos.length > 0 ? product.productGroup.productPhotos[0] : null;
      }

      // Calculate item total
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Check if product price has changed
      const priceChanged = currentPrice !== item.price;

      return {
        ...itemData,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          productType: product.productType,
          status: product.status,
          productPhoto
        },
        itemTotal,
        priceChanged,
        currentPrice
      };
    });

    // Return response
    return res.status(200).json({
      message: 'Cart fetched successfully',
      data: {
        id: cart.id,
        items: formattedItems,
        itemCount: formattedItems.length,
        subtotal,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching cart',
      error: error.message
    });
  }
});

/**
 * @DESC Add item to cart
 * @ROUTE POST /api/v1/cart
 * @ACCESS Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        errorMessage: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        errorMessage: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: 'ACTIVE',
        trash: false
      },
      select: {
        id: true,
        productType: true,
        productSimple: true,
        productVariable: true
      }
    });

    if (!product) {
      return res.status(404).json({
        errorMessage: 'Product not found or not available'
      });
    }

    // Get product price based on product type
    let price = 0;

    if (product.productType === 'SIMPLE' && product.productSimple) {
      price = product.productSimple.salePrice || product.productSimple.regularPrice;

      // Check if product is in stock
      if (product.productSimple.stock !== null && product.productSimple.stock < quantity) {
        return res.status(400).json({
          errorMessage: `Only ${product.productSimple.stock} items available in stock`
        });
      }
    } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0) {
      // For variable products, use the first variation's price (this can be enhanced to accept specific variation)
      price = product.productVariable[0].salePrice || product.productVariable[0].regularPrice;

      // Check if product is in stock
      if (product.productVariable[0].stock !== null && product.productVariable[0].stock < quantity) {
        return res.status(400).json({
          errorMessage: `Only ${product.productVariable[0].stock} items available in stock`
        });
      }
    } else if (product.productType === 'GROUP' && product.productGroup) {
      price = product.productGroup.salePrice || product.productGroup.regularPrice;

      if (product.productGroup.stock !== null && product.productGroup.stock < quantity) {
        return res.status(400).json({
          errorMessage: `Only ${product.productGroup.stock} items available in stock`
        });
      }
    } else {
      return res.status(400).json({
        errorMessage: 'Product price information not available'
      });
    }

    // Find or create user's cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId
        }
      });
    }

    // Check if product already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        trash: false
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
          price // Update price in case it changed
        },
        include: {
          product: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price
        },
        include: {
          product: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      });
    }

    // Return response
    return res.status(200).json({
      message: 'Product added to cart successfully',
      data: {
        id: cartItem.id,
        productId: cartItem.productId,
        productName: cartItem.product.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.price * cartItem.quantity
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      errorMessage: 'Error adding to cart',
      error: error.message
    });
  }
});

/**
 * @DESC Update cart item quantity
 * @ROUTE PUT /api/v1/cart/:itemId
 * @ACCESS Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        errorMessage: 'Quantity must be at least 1'
      });
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId
      }
    });

    if (!cart) {
      return res.status(404).json({
        errorMessage: 'Cart not found'
      });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
        trash: false
      },
      include: {
        product: {
          select: {
            id: true,
            productType: true,
            productSimple: true,
            productVariable: true,
            status: true
          }
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        errorMessage: 'Cart item not found'
      });
    }

    // Check if product is still active
    if (cartItem.product.status !== 'ACTIVE') {
      return res.status(400).json({
        errorMessage: 'Product is no longer available'
      });
    }

    // Check stock availability
    if (cartItem.product.productType === 'SIMPLE' && cartItem.product.productSimple) {
      if (cartItem.product.productSimple.stock !== null && cartItem.product.productSimple.stock < quantity) {
        return res.status(400).json({
          errorMessage: `Only ${cartItem.product.productSimple.stock} items available in stock`
        });
      }
    } else if (cartItem.product.productType === 'VARIABLE' && cartItem.product.productVariable && cartItem.product.productVariable.length > 0) {
      if (cartItem.product.productVariable[0].stock !== null && cartItem.product.productVariable[0].stock < quantity) {
        return res.status(400).json({
          errorMessage: `Only ${cartItem.product.productVariable[0].stock} items available in stock`
        });
      }
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: itemId
      },
      data: {
        quantity
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Cart item updated successfully',
      data: {
        id: updatedCartItem.id,
        productId: updatedCartItem.productId,
        productName: updatedCartItem.product.name,
        quantity: updatedCartItem.quantity,
        price: updatedCartItem.price,
        total: updatedCartItem.price * updatedCartItem.quantity
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      errorMessage: 'Error updating cart item',
      error: error.message
    });
  }
});

/**
 * @DESC Remove item from cart
 * @ROUTE DELETE /api/v1/cart/:itemId
 * @ACCESS Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId
      }
    });

    if (!cart) {
      return res.status(404).json({
        errorMessage: 'Cart not found'
      });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
        trash: false
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        errorMessage: 'Cart item not found'
      });
    }

    // Soft delete cart item
    await prisma.cartItem.update({
      where: {
        id: itemId
      },
      data: {
        trash: true
      }
    });

    // Return response
    return res.status(200).json({
      message: 'Item removed from cart successfully',
      data: {
        id: itemId
      }
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({
      errorMessage: 'Error removing cart item',
      error: error.message
    });
  }
});

/**
 * @DESC Clear cart (remove all items)
 * @ROUTE DELETE /api/v1/cart
 * @ACCESS Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId
      },
      include: {
        items: {
          where: {
            trash: false
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        message: 'Cart is already empty'
      });
    }

    // Soft delete all cart items
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
    return res.status(200).json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      errorMessage: 'Error clearing cart',
      error: error.message
    });
  }
});

/**
 * @DESC Sync cart with current product prices and availability
 * @ROUTE POST /api/v1/cart/sync
 * @ACCESS Private
 */
export const syncCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart with items
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

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        message: 'Cart is empty',
        data: {
          id: cart?.id,
          items: [],
          itemCount: 0,
          subtotal: 0
        }
      });
    }

    // Track changes
    const changes = {
      updated: [],
      removed: [],
      priceChanged: []
    };

    // Process each cart item
    for (const item of cart.items) {
      const product = item.product;

      // Check if product is still active
      if (product.status !== 'ACTIVE') {
        // Remove item from cart
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { trash: true }
        });

        changes.removed.push({
          id: item.id,
          productName: product.name,
          reason: 'Product is no longer available'
        });

        continue;
      }

      // Get current product price and stock
      let currentPrice = 0;
      let currentStock = null;

      if (product.productType === 'SIMPLE' && product.productSimple) {
        currentPrice = product.productSimple.salePrice || product.productSimple.regularPrice;
        currentStock = product.productSimple.stock;
      } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0) {
        currentPrice = product.productVariable[0].salePrice || product.productVariable[0].regularPrice;
        currentStock = product.productVariable[0].stock;
      } else {
        // Remove item if product type is not supported
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { trash: true }
        });

        changes.removed.push({
          id: item.id,
          productName: product.name,
          reason: 'Product type not supported'
        });

        continue;
      }

      // Check if price has changed
      if (currentPrice !== item.price) {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { price: currentPrice }
        });

        changes.priceChanged.push({
          id: item.id,
          productName: product.name,
          oldPrice: item.price,
          newPrice: currentPrice
        });
      }

      // Check if stock is sufficient
      if (currentStock !== null && currentStock < item.quantity) {
        if (currentStock === 0) {
          // Remove item if out of stock
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { trash: true }
          });

          changes.removed.push({
            id: item.id,
            productName: product.name,
            reason: 'Product is out of stock'
          });
        } else {
          // Update quantity to match available stock
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: currentStock }
          });

          changes.updated.push({
            id: item.id,
            productName: product.name,
            oldQuantity: item.quantity,
            newQuantity: currentStock,
            reason: 'Adjusted to available stock'
          });
        }
      }
    }

    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
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
                slug: true,
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

    // Format cart items and calculate totals
    let subtotal = 0;
    const formattedItems = updatedCart.items.map((item) => {
      const { product, ...itemData } = item;

      // Get product photo
      let productPhoto = null;

      if (product.productType === 'SIMPLE' && product.productSimple) {
        productPhoto = product.productSimple.productPhotos && product.productSimple.productPhotos.length > 0 ? product.productSimple.productPhotos[0] : null;
      } else if (product.productType === 'VARIABLE' && product.productVariable && product.productVariable.length > 0) {
        productPhoto = product.productVariable[0].productPhotos && product.productVariable[0].productPhotos.length > 0 ? product.productVariable[0].productPhotos[0] : null;
      }

      // Calculate item total
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      return {
        ...itemData,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          productType: product.productType,
          status: product.status,
          productPhoto
        },
        itemTotal
      };
    });

    // Return response
    return res.status(200).json({
      message: 'Cart synchronized successfully',
      data: {
        id: updatedCart.id,
        items: formattedItems,
        itemCount: formattedItems.length,
        subtotal,
        changes
      }
    });
  } catch (error) {
    console.error('Error synchronizing cart:', error);
    return res.status(500).json({
      errorMessage: 'Error synchronizing cart',
      error: error.message
    });
  }
});

/**
 * @DESC Get cart count (number of items)
 * @ROUTE GET /api/v1/cart/count
 * @ACCESS Private
 */
export const getCartCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
        trash: false
      },
      include: {
        _count: {
          select: {
            items: {
              where: {
                trash: false
              }
            }
          }
        }
      }
    });

    const itemCount = cart ? cart._count.items : 0;

    // Return response
    return res.status(200).json({
      message: 'Cart count fetched successfully',
      data: {
        count: itemCount
      }
    });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return res.status(500).json({
      errorMessage: 'Error fetching cart count',
      error: error.message
    });
  }
});
