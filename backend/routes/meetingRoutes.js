import { Router } from "express";
import { listMeetings, getMeetingById, getMeetingByMeetingId, joinMeeting, listMeetingsByEmail, addParticipants, listParticipants } from "../controllers/meetingController.js";
import { requireAuth, verifyUser } from "../middleware/auth.js";

const router = Router();

// All meeting routes now require authentication
router.get("/", requireAuth, verifyUser, listMeetings);
router.get("/by-email", requireAuth, verifyUser, listMeetingsByEmail); // ?email=
router.get("/id/:id", requireAuth, verifyUser, getMeetingById);
router.get("/mid/:meetingId", requireAuth, verifyUser, getMeetingByMeetingId);
router.post("/:meetingId/join", requireAuth, verifyUser, joinMeeting);
router.post("/:meetingId/participants", requireAuth, verifyUser, addParticipants);
router.get("/:meetingId/participants", requireAuth, verifyUser, listParticipants);

export default router;
