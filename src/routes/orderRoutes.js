
import { protect } from '../middlewares/authMiddleware.js';
import Order from '../models/Order.js';

// @route GET /api/orders
// @desc Fetch user orders
// @access Private
router.get('/orders', protect, async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });