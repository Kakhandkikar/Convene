// Load environment variables FIRST
import dotenv from "dotenv";
const result = dotenv.config({ path: "./.env" });  // force load

console.log("dotenv result:", result);
console.log("GOOGLE_CLIENT_ID (from server.js):", process.env.GOOGLE_CLIENT_ID);

// Now import other modules after env vars are loaded
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";

import apiRouter from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import { startScheduler } from "./utils/scheduler.js";



// Debug: Check if environment variables are loaded
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "***SET***" : "NOT SET");

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware will be initialized in startServer()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Health check route
app.get("/", (req, res) =>
  res.json({ status: "ok", service: "gemini-scheduler-backend" })
);

// API routes will be set up in startServer()

// Config
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/meetingsdb";

// MongoDB connection + server start
async function startServer() {
  try {
    // Import passport after env vars are loaded
    const passport = (await import("./config/passport.js")).default;
    
    // Initialize passport middleware BEFORE routes
    app.use(passport.initialize());
    app.use(passport.session());

    // Set up API routes AFTER passport is initialized
    app.use("/api", apiRouter);
    app.use("/api/auth", authRoutes);

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      
      // Start the summary scheduler
      startScheduler();
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected. Server shutting down.");
  process.exit(0);
});
