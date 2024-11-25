import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middlewares/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

// @route   POST /api/cart/add
// @desc    Add a product to the cart
// @access  Private
router.post('/add', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      // Update quantity if the product already exists
      existingItem.quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/cart
// @desc    Get all items in the cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price imageUrl');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/remove/:id
// @desc    Remove a product from the cart
// @access  Private
router.delete('/remove/:id', protect, async (req, res) => {
  const productId = req.params.id;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Filter out the product to remove it
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart/update
// @desc    Update quantity of a product in the cart
// @access  Private
router.put('/update', protect, async (req, res) => {
    const { productId, quantity } = req.body;
  
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
  
    try {
      // Find the cart for the user
      let cart = await Cart.findOne({ user: req.user.id });
  
      if (!cart) {
        // If no cart exists, create a new one
        cart = new Cart({ user: req.user.id, products: [] });
      }
  
      const productIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (productIndex > -1) {
        cart.items[productIndex].quantity = quantity;
        } else {
        cart.items.push({ product: productId, quantity });
        }

  
      // Save the updated cart
      await cart.save();
  
      res.status(200).json({ message: 'Cart updated successfully', cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // @route   DELETE /api/cart/clear
// @desc    Clear all items in the cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
      // Find the cart for the authenticated user
      const cart = await Cart.findOne({ user: req.user.id });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Clear all items from the cart
      cart.items = [];
  
      // Save the empty cart
      await cart.save();
  
      res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


 // @route   POST /api/cart/checkout
// @desc    Checkout the cart, create an order, and clear the cart
// @access  Private
router.post('/checkout', protect, async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
  
    try {

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price stock');

  
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty' });
      }
  
      // Step 2: Validate stock and calculate total price
      let totalPrice = 0;
      const orderItems = [];
  
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
  
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product.name} not found` });
        }
  
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
  
        totalPrice += product.price * item.quantity;
  
        // Prepare order items
        orderItems.push({
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          product: product._id,
        });
  
        // Reduce product stock
        product.stock -= item.quantity;
        await product.save();
      }
  
      // Step 3: Create the order
      const order = new Order({
        user: req.user.id,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
      });
  
      await order.save();
  
      // Step 4: Clear the user's cart
      cart.items = [];
      await cart.save();
  
      // Step 5: Respond with order details
      res.status(201).json({
        message: 'Order placed successfully',
        order,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
