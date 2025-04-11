// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Lawyer from '../models/Lawyer.js';

// authMiddleware.js
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if lawyer or user
    if (decoded.role === 'lawyer') {
      req.lawyer = await Lawyer.findById(decoded.id).select('-password');
      if (!req.lawyer) {
        return res.status(401).json({
          success: false,
          message: 'Lawyer belonging to this token no longer exists'
        });
      }
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// Specific lawyer protection middleware
export const lawyerProtect = async (req, res, next) => {
  if (!req.lawyer) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as lawyer'
    });
  }
  next();
};

export const userProtect = async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as user'
    });
  }
  next();
};
