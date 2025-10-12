import { Router } from "express";
import { createRetrospective, getMeetingRetrospectives, getUserRetrospectives } from "../controllers/retrospectiveController.js";
import { requireAuth, verifyUser } from "../middleware/auth.js";

const router = Router();

// All retrospective routes require authentication
router.post("/", requireAuth, verifyUser, createRetrospective);
router.get("/meeting/:meetingId", requireAuth, verifyUser, getMeetingRetrospectives);
router.get("/my", requireAuth, verifyUser, getUserRetrospectives);

export default router;





