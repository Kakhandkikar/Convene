import { Router } from "express";
import { listMeetings, getMeeting } from "../controllers/meetingController.js";
const router = Router();
router.get("/", listMeetings);
router.get("/:id", getMeeting);
export default router;
