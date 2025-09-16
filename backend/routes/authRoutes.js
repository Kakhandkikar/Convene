import express from "express";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"] 
  })
);

router.get("/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "/auth?error=google_auth_failed" 
  }),
  async (req, res) => {
    try {
      // Successful authentication, redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?auth=success`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth?error=server_error`);
    }
  }
);

// Get current user
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        provider: req.user.provider
      }
    });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

export default router;

