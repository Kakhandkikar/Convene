import mongoose from 'mongoose';
import Meeting from './models/Meeting.js';
import Participant from './models/Participant.js';
import Retrospective from './models/Retrospective.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meetingsdb';

async function checkRetrospectives() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const meetingId = 'MTGMFHUD0ZB3OY3';
    
    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      console.log('❌ Meeting not found with ID:', meetingId);
      return;
    }
    
    console.log('📋 Meeting Details:');
    console.log('  - Meeting ID:', meeting.meetingId);
    console.log('  - Title:', meeting.title);
    console.log('  - Host Email:', meeting.hostEmail);
    console.log('  - Status:', meeting.status);
    console.log('  - Created:', meeting.createdAt);
    
    // Count total participants
    const totalParticipants = await Participant.countDocuments({ meeting: meeting._id });
    console.log('\n👥 Participants:');
    console.log('  - Total Participants:', totalParticipants);
    
    // Get participant details
    const participants = await Participant.find({ meeting: meeting._id }).select('email name role joinedAt');
    participants.forEach((p, index) => {
      console.log(`    ${index + 1}. ${p.email} (${p.role}) - Joined: ${p.joinedAt}`);
    });
    
    // Count submitted retrospectives
    const submittedRetros = await Retrospective.countDocuments({ meeting: meeting._id });
    console.log('\n📝 Retrospectives:');
    console.log('  - Submitted:', submittedRetros);
    console.log('  - Missing:', totalParticipants - submittedRetros);
    
    // Get retrospective details
    const retrospectives = await Retrospective.find({ meeting: meeting._id })
      .populate('participant', 'email name role')
      .select('email content scores createdAt');
    
    console.log('\n📊 Retrospective Details:');
    retrospectives.forEach((r, index) => {
      console.log(`    ${index + 1}. ${r.participant?.email || r.email}`);
      console.log(`       Content: ${r.content.substring(0, 50)}...`);
      console.log(`       Scores: ${JSON.stringify(r.scores)}`);
      console.log(`       Submitted: ${r.createdAt}`);
      console.log('');
    });
    
    // Check if summary should be triggered
    if (totalParticipants > 0 && submittedRetros === totalParticipants) {
      console.log('✅ All participants have submitted retrospectives - Summary should be generated!');
    } else {
      console.log('⏳ Waiting for more retrospectives to be submitted');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkRetrospectives();
