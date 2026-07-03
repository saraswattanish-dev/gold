import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dbService from '../services/dbService.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      let user = null;

      if (supabase) {
        // Verify token with Supabase Auth
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
        if (error || !authUser) {
          return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
        }
        user = await dbService.findUserById(authUser.id);
      } else {
        // Verify token with local JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aryansh-gold-secret-key-2026');
        user = await dbService.findUserById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user profile not found' });
      }

      delete user.password;
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
