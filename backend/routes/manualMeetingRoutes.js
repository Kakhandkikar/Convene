import { Router } from "express";
import { createManualMeeting } from "../controllers/manualMeetingController.js";

const router = Router();
router.post("/", createManualMeeting);
export default router;
