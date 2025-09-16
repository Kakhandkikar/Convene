import { Router } from "express";
import { 
  generateSummary, 
  getSummary, 
  listSummaries 
} from "../controllers/summaryController.js";

const router = Router();

// POST /api/summaries/:meetingId/generate - Manually trigger summary generation
router.post("/:meetingId/generate", generateSummary);

// GET /api/summaries/:meetingId - Get summary for a specific meeting
router.get("/:meetingId", getSummary);

// GET /api/summaries/:meetingId/list - Get all summaries for a meeting
router.get("/:meetingId/list", listSummaries);

export default router;
