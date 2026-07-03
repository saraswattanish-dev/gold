import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import csv from 'csv-parser';
import dbService from '../services/dbService.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();
const isVercel = process.env.VERCEL === '1';

// Multer Storage Configuration for Images & CSVs
const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: isVercel ? memoryStorage : diskStorage });

// @desc    Upload product image file
// @route   POST /api/products/upload-image
// @access  Private/Admin
router.post('/upload-image', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    
    let imageUrl = '';
    if (isVercel) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all products with filters & search
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await dbService.findProducts(req.query);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await dbService.findProductById(req.params.id);
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, sku, description, price, category, purity, weight, images, stock } = req.body;

  try {
    const productExists = await dbService.findProductBySku(sku);
    if (productExists) {
      return res.status(400).json({ success: false, message: 'Product SKU already exists' });
    }

    const createdProduct = await dbService.createProduct({
      name,
      sku,
      description,
      price: Number(price),
      category,
      purity,
      weight: Number(weight),
      images: Array.isArray(images) ? images : [images],
      stock: stock !== undefined ? Number(stock) : 10
    });

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, sku, description, price, category, purity, weight, images, stock } = req.body;

  try {
    const product = await dbService.findProductById(req.params.id);

    if (product) {
      const updatedFields = {
        name: name || product.name,
        sku: sku || product.sku,
        description: description || product.description,
        price: price !== undefined ? Number(price) : product.price,
        category: category || product.category,
        purity: purity || product.purity,
        weight: weight !== undefined ? Number(weight) : product.weight,
        images: images ? (Array.isArray(images) ? images : [images]) : product.images,
        stock: stock !== undefined ? Number(stock) : product.stock
      };

      const updatedProduct = await dbService.updateProduct(req.params.id, updatedFields);
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await dbService.findProductById(req.params.id);
    if (product) {
      await dbService.deleteProduct(product._id);
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Bulk Upload products via CSV
// @route   POST /api/products/bulk-upload
// @access  Private/Admin
router.post('/bulk-upload', protect, admin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
  }

  const products = [];
  const errors = [];

  let csvStream;
  if (isVercel) {
    const { Readable } = await import('stream');
    csvStream = Readable.from(req.file.buffer);
  } else {
    csvStream = fs.createReadStream(req.file.path);
  }

  csvStream
    .pipe(csv())
    .on('data', (row) => {
      try {
        if (!row.name || !row.sku || !row.price || !row.category || !row.purity || !row.weight) {
          throw new Error(`Missing required fields on SKU: ${row.sku || 'Unknown'}`);
        }

        products.push({
          name: row.name.trim(),
          sku: row.sku.trim(),
          description: row.description ? row.description.trim() : 'Premium fine jewelry by Aryansh Gold',
          price: Number(row.price),
          category: row.category.trim(),
          purity: row.purity.trim(),
          weight: Number(row.weight),
          images: row.images ? row.images.split(',').map(img => img.trim()) : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
          stock: row.stock ? Number(row.stock) : 10
        });
      } catch (err) {
        errors.push(err.message);
      }
    })
    .on('end', async () => {
      // Delete temporary file if on disk
      if (!isVercel && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (errors.length > 0 && products.length === 0) {
        return res.status(400).json({ success: false, message: 'Errors in CSV file', errors });
      }

      try {
        await dbService.bulkUpsertProducts(products);
        res.json({
          success: true,
          message: `Processed ${products.length} products successfully in the catalog.`,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message, errors });
      }
    })
    .on('error', (error) => {
      if (!isVercel && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, message: 'Failed to parse CSV file', error: error.message });
    });
});

export default router;
