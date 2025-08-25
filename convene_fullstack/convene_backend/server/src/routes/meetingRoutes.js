import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateCreate, createMeeting, listMeetings, getMeeting, validateAddParticipants, addParticipants } from '../controllers/meetingController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listMeetings);
router.post('/', validateCreate, createMeeting);
router.get('/:id', getMeeting);
router.post('/:id/participants', validateAddParticipants, addParticipants);

export default router;
