import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dbService from '../services/dbService.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay SDK. Fallback to mock behavior if keys are missing.
let razorpayInstance = null;
const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay SDK Initialized Successfully.');
  } catch (error) {
    console.error('Failed to initialize Razorpay SDK:', error.message);
  }
} else {
  console.log('Razorpay Key ID/Secret not found in environment. Running in Mock Checkout Sandbox mode.');
}

// @desc    Create a new order & initiate Razorpay order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress, totalAmount, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  try {
    // 1. Double check product stock
    for (const item of items) {
      const product = await dbService.findProductById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.name}` });
      }
    }

    // 2. Generate Razorpay / Mock Order if not COD
    let razorpayOrderId = null;
    let keyId = null;

    if (paymentMethod === 'COD') {
      // Deduct stock levels immediately for COD
      for (const item of items) {
        const product = await dbService.findProductById(item.product);
        await dbService.updateProduct(item.product, {
          stock: Math.max(0, product.stock - item.quantity)
        });
      }
    } else {
      razorpayOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      keyId = process.env.RAZORPAY_KEY_ID || 'mock_key_id';

      if (isRazorpayConfigured && razorpayInstance) {
        try {
          const rzpOrder = await razorpayInstance.orders.create({
            amount: Math.round(totalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
          });
          razorpayOrderId = rzpOrder.id;
        } catch (err) {
          console.error('Razorpay Order Create Error:', err);
          return res.status(500).json({ success: false, message: 'Payment gateway initialization failed' });
        }
      }
    }

    // 3. Create local DB Order
    const order = await dbService.createOrder({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentStatus: 'Pending',
      paymentDetails: paymentMethod === 'COD' ? {} : {
        razorpayOrderId
      },
      orderStatus: paymentMethod === 'COD' ? 'Confirmed' : 'Pending'
    });

    // 4. Return details to client
    if (paymentMethod === 'COD') {
      return res.status(201).json({
        success: true,
        order,
        isCOD: true
      });
    }

    res.status(201).json({
      success: true,
      order,
      razorpayDetails: {
        id: razorpayOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        key: keyId,
        isMock: !isRazorpayConfigured
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Verify payment signature
// @route   POST /api/orders/verify-payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const order = await dbService.findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let isVerified = false;

    if (isRazorpayConfigured && razorpaySignature) {
      // Cryptographic signature verify
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === razorpaySignature) {
        isVerified = true;
      }
    } else {
      // Mock Sandbox Verification
      if (razorpayPaymentId && razorpayOrderId.startsWith('mock_order_')) {
        isVerified = true;
      }
    }

    if (isVerified) {
      // 1. Update stock levels for products
      for (const item of order.items) {
        const product = await dbService.findProductById(item.product);
        if (product) {
          await dbService.updateProduct(item.product, {
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      // 2. Update order payment statuses
      const updatedOrder = await dbService.updateOrder(orderId, {
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        paymentDetails: {
          ...order.paymentDetails,
          razorpayPaymentId: razorpayPaymentId || `mock_payment_${Date.now()}`,
          razorpaySignature: razorpaySignature || `mock_sig_${Date.now()}`
        },
        paidAt: new Date()
      });

      res.json({ success: true, message: 'Payment verified and order confirmed', order: updatedOrder });
    } else {
      await dbService.updateOrder(orderId, { paymentStatus: 'Failed' });
      res.status(400).json({ success: false, message: 'Payment verification signature mismatch' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await dbService.findOrders({ user_id: req.user._id });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await dbService.findOrderById(req.params.id);

    if (order) {
      // Verify owner or admin
      const orderUserId = order.user_id || order.user?._id || order.user;
      if (orderUserId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      res.json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await dbService.findOrders({});
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { orderStatus } = req.body;

  try {
    const order = await dbService.findOrderById(req.params.id);

    if (order) {
      const updateFields = {
        orderStatus: orderStatus || order.orderStatus
      };

      if (orderStatus === 'Shipped') {
        updateFields.shippedAt = new Date();
      } else if (orderStatus === 'Delivered') {
        updateFields.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
          updateFields.paymentStatus = 'Paid';
          updateFields.paidAt = new Date();
        }
      }

      const updatedOrder = await dbService.updateOrder(req.params.id, updateFields);
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
