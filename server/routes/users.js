import express from 'express';
import dbService from '../services/dbService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Update/sync user cart
// @route   POST /api/users/cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
  const { cart } = req.body; // Array of { product: id, quantity: number }

  try {
    const user = await dbService.findUserById(req.user._id);

    if (user) {
      const updatedUser = await dbService.updateUser(user._id, { cart });
      
      // Populate cart products
      const products = await dbService.findProducts();
      const populatedCart = (updatedUser.cart || []).map(item => {
        const prod = products.find(p => p._id.toString() === (item.product?._id || item.product).toString());
        return {
          ...item,
          product: prod || item.product
        };
      }).filter(item => item.product !== null);

      res.json({ success: true, cart: populatedCart });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle item in wishlist
// @route   POST /api/users/wishlist
// @access  Private
router.post('/wishlist', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await dbService.findUserById(req.user._id);

    if (user) {
      const wishlist = [...(user.wishlist || [])];
      const index = wishlist.indexOf(productId);
      
      if (index === -1) {
        wishlist.push(productId);
      } else {
        wishlist.splice(index, 1);
      }

      const updatedUser = await dbService.updateUser(user._id, { wishlist });

      // Populate wishlist products
      const products = await dbService.findProducts();
      const populatedWishlist = wishlist.map(id => 
        products.find(p => p._id.toString() === id.toString()) || id
      ).filter(p => p !== null);

      res.json({ success: true, wishlist: populatedWishlist });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
