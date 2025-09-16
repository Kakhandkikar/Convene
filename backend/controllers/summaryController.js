import Meeting from "../models/Meeting.js";
import Participant from "../models/Participant.js";
import Retrospective from "../models/Retrospective.js";
import Summary from "../models/Summary.js";
import { summarizeRetrospectives } from "../utils/summarizer.js";
import { generateSummaryFile, deleteFile } from "../utils/fileGenerator.js";
import { sendSummaryEmail } from "../utils/mailer.js";

// Main function to generate summary for a meeting
export async function generateSummaryForMeeting(meetingId, triggerReason = "manual") {
  try {
    console.log(`Starting summary generation for meeting ${meetingId}, trigger: ${triggerReason}`);
    
    // 1. Get meeting details
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // 2. Check if summary already exists for this meeting
    const existingSummary = await Summary.findOne({ meeting: meetingId });
    if (existingSummary && existingSummary.status === 'completed') {
      console.log(`Summary already exists for meeting ${meetingId}`);
      return existingSummary;
    }

    // 3. Get all retrospectives for this meeting
    const retrospectives = await Retrospective.find({ meeting: meetingId })
      .populate('participant', 'email name role')
      .sort({ createdAt: 1 });

    if (retrospectives.length === 0) {
      throw new Error('No retrospectives found for this meeting');
    }

    console.log(`Found ${retrospectives.length} retrospectives for meeting ${meetingId}`);

    // 4. Create or update summary record
    let summary;
    if (existingSummary) {
      summary = existingSummary;
      summary.status = 'generating';
      summary.triggerReason = triggerReason;
      await summary.save();
    } else {
      summary = new Summary({
        meeting: meetingId,
        triggerReason,
        status: 'generating'
      });
      await summary.save();
    }

    // 5. Generate summary using Gemini
    console.log('Generating summary with Gemini...');
    const summaryText = await summarizeRetrospectives(retrospectives);
    
    if (!summaryText || summaryText.trim().length === 0) {
      throw new Error('Failed to generate summary text');
    }

    summary.summaryText = summaryText;
    summary.status = 'completed';
    summary.generatedAt = new Date();
    await summary.save();

    console.log('Summary generated successfully');

    // 6. Generate text file
    console.log('Generating text file...');
    const { fileName, filePath } = generateSummaryFile(meeting, summary, retrospectives);
    
    summary.fileName = fileName;
    summary.filePath = filePath;
    await summary.save();

    // 7. Email to host
    if (meeting.hostEmail) {
      console.log(`Sending summary email to host: ${meeting.hostEmail}`);
      try {
        await sendSummaryEmail(meeting, summary, filePath);
        summary.emailSent = true;
        summary.emailSentAt = new Date();
        await summary.save();
        console.log('Summary email sent successfully');
      } catch (emailError) {
        console.error('Failed to send summary email:', emailError);
        // Don't fail the whole process if email fails
      }
    } else {
      console.log('No host email found, skipping email notification');
    }

    // 8. Schedule file cleanup (delete after 24 hours)
    setTimeout(() => {
      deleteFile(filePath);
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log(`Summary generation completed for meeting ${meetingId}`);
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Update summary status to failed
    try {
      await Summary.findOneAndUpdate(
        { meeting: meetingId },
        { status: 'failed' }
      );
    } catch (updateError) {
      console.error('Failed to update summary status:', updateError);
    }
    
    throw error;
  }
}

// API endpoint to manually trigger summary generation
export async function generateSummary(req, res) {
  try {
    const { meetingId } = req.params;
    const { triggerReason = "manual" } = req.body;

    const summary = await generateSummaryForMeeting(meetingId, triggerReason);
    
    res.json({
      success: true,
      message: 'Summary generation initiated',
      summary: {
        id: summary._id,
        status: summary.status,
        generatedAt: summary.generatedAt,
        triggerReason: summary.triggerReason
      }
    });
  } catch (error) {
    console.error('Error in generateSummary API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// API endpoint to get summary status and content
export async function getSummary(req, res) {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const summary = await Summary.findOne({ meeting: meeting._id })
      .populate('meeting', 'meetingId title hostEmail');

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({
      success: true,
      summary: {
        id: summary._id,
        status: summary.status,
        summaryText: summary.summaryText,
        generatedAt: summary.generatedAt,
        triggerReason: summary.triggerReason,
        emailSent: summary.emailSent,
        emailSentAt: summary.emailSentAt,
        fileName: summary.fileName,
        meeting: summary.meeting
      }
    });
  } catch (error) {
    console.error('Error in getSummary API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// API endpoint to get all summaries for a meeting
export async function listSummaries(req, res) {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const summaries = await Summary.find({ meeting: meeting._id })
      .populate('meeting', 'meetingId title hostEmail')
      .sort({ generatedAt: -1 });

    res.json({
      success: true,
      summaries: summaries.map(summary => ({
        id: summary._id,
        status: summary.status,
        generatedAt: summary.generatedAt,
        triggerReason: summary.triggerReason,
        emailSent: summary.emailSent,
        emailSentAt: summary.emailSentAt,
        fileName: summary.fileName
      }))
    });
  } catch (error) {
    console.error('Error in listSummaries API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Function to check if all participants have submitted retrospectives
export async function checkAndTriggerSummary(meetingId) {
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      console.log(`Meeting ${meetingId} not found`);
      return;
    }

    // Count total participants
    const totalParticipants = await Participant.countDocuments({ meeting: meetingId });
    
    // Count submitted retrospectives
    const submittedRetros = await Retrospective.countDocuments({ meeting: meetingId });
    
    console.log(`Meeting ${meetingId}: ${submittedRetros}/${totalParticipants} retrospectives submitted`);

    // Trigger when at least (participants - 1) have submitted
    const threshold = Math.max(1, totalParticipants - 1);
    if (totalParticipants > 0 && submittedRetros >= threshold) {
      console.log(`All participants have submitted retrospectives for meeting ${meetingId}, triggering summary generation`);
      await generateSummaryForMeeting(meetingId, "all_submitted");
    }
  } catch (error) {
    console.error('Error checking and triggering summary:', error);
  }
}

// Function to check meetings that need time-based summary generation
export async function checkTimeBasedSummaries() {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Find meetings that are scheduled between now and 30 minutes from now
    const meetings = await Meeting.find({
      status: 'scheduled',
      organizerTime: {
        $gte: now,
        $lte: thirtyMinutesFromNow
      }
    });

    console.log(`Found ${meetings.length} meetings for time-based summary check`);

    for (const meeting of meetings) {
      // Check if summary already exists
      const existingSummary = await Summary.findOne({ 
        meeting: meeting._id,
        status: { $in: ['completed', 'generating'] }
      });

      if (!existingSummary) {
        console.log(`Triggering time-based summary for meeting ${meeting.meetingId}`);
        await generateSummaryForMeeting(meeting._id, "time_based");
      } else {
        console.log(`Summary already exists for meeting ${meeting.meetingId}`);
      }
    }
  } catch (error) {
    console.error('Error checking time-based summaries:', error);
  }
}
