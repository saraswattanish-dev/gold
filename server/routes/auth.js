import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import dbService from '../services/dbService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aryansh-gold-secret-key-2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await dbService.findUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Determine role (strictly allow admin if email matches designated admin)
    const userRole = (email.toLowerCase() === 'anshgupta0428@gmail.com') ? 'admin' : 'user';

    let user = null;
    let token = '';

    if (supabase) {
      // 1. Create user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        return res.status(400).json({ success: false, message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ success: false, message: 'Failed to create Supabase auth user.' });
      }

      // 2. Create profile row in public.users table (no password stored!)
      user = await dbService.createUser({
        id: authData.user.id,
        name,
        email,
        role: userRole
      });

      // Retrieve Supabase token if available (could be null if email verification is enabled)
      token = authData.session?.access_token || '';
      if (!token) {
        token = generateToken(user._id);
      }
    } else {
      // Local fallback (in-memory mode) - hash password and save to dbStore
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await dbService.createUser({
        name,
        email,
        password: hashedPassword,
        role: userRole
      });

      token = generateToken(user._id);
    }

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let token = '';

    if (supabase) {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(401).json({ success: false, message: authError.message });
      }

      // 2. Fetch profile from public.users table
      user = await dbService.findUserById(authData.user.id);
      if (!user) {
        // Auto-create user profile row if missing
        const userRole = (email.toLowerCase() === 'anshgupta0428@gmail.com') ? 'admin' : 'user';
        user = await dbService.createUser({
          id: authData.user.id,
          name: email.split('@')[0],
          email,
          role: userRole
        });
      }

      token = authData.session.access_token;
    } else {
      // Local fallback (in-memory mode)
      user = await dbService.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        token = generateToken(user._id);
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    // Auto-upgrade to admin role in database if email matches designated admin email and is not already admin
    if (email.toLowerCase() === 'anshgupta0428@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
      await dbService.updateUser(user._id, { role: 'admin' });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user._id);
    if (user) {
      // Populate wishlist and cart products
      const products = await dbService.findProducts();
      
      const populatedWishlist = (user.wishlist || []).map(id => 
        products.find(p => p._id.toString() === id.toString()) || id
      ).filter(p => p !== null);

      const populatedCart = (user.cart || []).map(item => {
        const prod = products.find(p => p._id.toString() === (item.product?._id || item.product).toString());
        return {
          ...item,
          product: prod || item.product
        };
      }).filter(item => item.product !== null);

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: populatedWishlist,
        cart: populatedCart
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
