import Retrospective from "../models/Retrospective.js";
import Meeting from "../models/Meeting.js";
import Participant from "../models/Participant.js";
import { checkAndTriggerSummary } from "./summaryController.js";

// Create a new retrospective
export async function createRetrospective(req, res) {
  try {
    const { meetingId, content, scores } = req.body;
    const userEmail = req.user.email.toLowerCase();

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Verify user is a participant in this meeting
    const participant = await Participant.findOne({
      meeting: meeting._id,
      email: userEmail
    });

    if (!participant) {
      return res.status(403).json({ 
        error: "You must be a participant in this meeting to submit a retrospective" 
      });
    }

    // Check if user already submitted a retrospective for this meeting
    const existingRetrospective = await Retrospective.findOne({
      meeting: meeting._id,
      participant: participant._id
    });

    if (existingRetrospective) {
      return res.status(400).json({ 
        error: "You have already submitted a retrospective for this meeting" 
      });
    }

    // Create new retrospective
    const retrospective = new Retrospective({
      meeting: meeting._id,
      participant: participant._id,
      user: req.user._id,
      email: userEmail,
      content,
      scores: scores || {}
    });

    await retrospective.save();

    // Auto-trigger summary generation check after a submission
    try {
      await checkAndTriggerSummary(meeting._id);
    } catch (triggerError) {
      console.error("Auto-trigger summary check failed:", triggerError);
    }

    res.json({ 
      success: true, 
      message: "Retrospective submitted successfully",
      retrospective 
    });
  } catch (error) {
    console.error("Error creating retrospective:", error);
    res.status(500).json({ error: "Failed to submit retrospective" });
  }
}

// Get retrospectives for a meeting (only for participants)
export async function getMeetingRetrospectives(req, res) {
  try {
    const { meetingId } = req.params;
    const userEmail = req.user.email.toLowerCase();

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Verify user is a participant
    const participant = await Participant.findOne({
      meeting: meeting._id,
      email: userEmail
    });

    if (!participant) {
      return res.status(403).json({ 
        error: "You must be a participant in this meeting to view retrospectives" 
      });
    }

    // Get all retrospectives for this meeting
    const retrospectives = await Retrospective.find({ meeting: meeting._id })
      .populate('participant', 'email name')
      .sort({ createdAt: -1 });

    res.json(retrospectives);
  } catch (error) {
    console.error("Error fetching retrospectives:", error);
    res.status(500).json({ error: "Failed to fetch retrospectives" });
  }
}

// Get user's own retrospectives
export async function getUserRetrospectives(req, res) {
  try {
    const userEmail = req.user.email.toLowerCase();

    const retrospectives = await Retrospective.find({ email: userEmail })
      .populate('meeting', 'meetingId title organizerTime')
      .populate('participant', 'email name')
      .sort({ createdAt: -1 });

    res.json(retrospectives);
  } catch (error) {
    console.error("Error fetching user retrospectives:", error);
    res.status(500).json({ error: "Failed to fetch retrospectives" });
  }
}