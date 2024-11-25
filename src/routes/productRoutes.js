import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// File filter to allow only webp, jpg, and png files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extname && mimeType) {
    return cb(null, true); // Accept file
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .webp files are allowed!'), false); // Reject file
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set filename with extension
  },
});

const upload = multer({
  storage,
  fileFilter, // Add the file filter here
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit file size to 5MB
});

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
      const { name, description, price, category, stock } = req.body;
      const product = await Product.findById(req.params.id);
  
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock || product.stock;
  
      if (req.file) {
        product.imageUrl = `/uploads/${req.file.filename}`;
      }
  
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

  // @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
