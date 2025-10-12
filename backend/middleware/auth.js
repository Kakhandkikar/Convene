// Authentication middleware to protect routes
export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // If not authenticated, return 401
  res.status(401).json({ 
    success: false, 
    message: "Authentication required" 
  });
};

// Optional auth middleware (doesn't fail if not authenticated)
export const optionalAuth = (req, res, next) => {
  // Always continue, but req.user will be undefined if not authenticated
  next();
};

// Middleware to check if user exists in database
export const verifyUser = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }

  try {
    // Verify user still exists in database
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      // User was deleted, destroy session
      req.logout((err) => {
        if (err) console.error("Logout error:", err);
      });
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Add fresh user data to request
    req.user = user;
    next();
  } catch (error) {
    console.error("User verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during authentication" 
    });
  }
};





