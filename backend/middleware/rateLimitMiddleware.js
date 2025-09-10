// Rate limiting middleware to prevent API abuse
const rateLimit = (limit, timeWindow) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Create key from IP and, if authenticated, user ID
    const key = req.user ? `${ip}-${req.user.id}` : ip;
    
    // Get current time
    const now = Date.now();
    
    // Get existing request data or create new
    const requestData = requests.get(key) || {
      count: 0,
      resetTime: now + timeWindow
    };
    
    // Check if time window has passed and reset if needed
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + timeWindow;
    }
    
    // Increment request count
    requestData.count += 1;
    
    // Update the map
    requests.set(key, requestData);
    
    // Check if limit exceeded
    if (requestData.count > limit) {
      // Log rate limit exceeded
      const logError = require('../utils/logger/errorLogger');
      const error = new Error('Rate limit exceeded');
      logError(error, 'rateLimitMiddleware', {
        ip,
        userID: req.user?.id,
        path: req.path,
        method: req.method,
        requestCount: requestData.count,
        limit
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    // Add rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requestData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));
    
    next();
  };
};

module.exports = rateLimit;
