import { Router } from "express";
import geminiRoutes from "./geminiRoutes.js";
import meetingRoutes from "./meetingRoutes.js";
import retrospectiveRoutes from "./retrospectiveRoutes.js";
import summaryRoutes from "./summaryRoutes.js";
import manualMeetingRoutes from "./manualMeetingRoutes.js";

const router = Router();

router.use("/gemini", geminiRoutes);
router.use("/meetings", meetingRoutes);
router.use("/retrospectives", retrospectiveRoutes);
router.use("/summaries", summaryRoutes);
router.use("/manual", manualMeetingRoutes);

export default router;


