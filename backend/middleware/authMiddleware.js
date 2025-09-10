const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // If no token found, return unauthorized
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user info to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message
    });
  }
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

module.exports = {
  authenticate,
  authorizeAdmin
};
