import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  email: { type: String, required: true },
  invitedAt: Date,
});

const meetingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['online', 'offline'], required: true },
  platform: { type: String, enum: ['zoom', 'google', 'microsoft', 'other', 'offline'], default: 'offline' },
  context: { type: String, enum: ['organizational', 'international'], required: true },
  month: Number,
  week: Number,
  orgTimezone: { type: String, default: 'UTC' },
  clientTimezone: { type: String },
  allowWeekends: { type: Boolean, default: false },
  allowHolidays: { type: Boolean, default: true },
  durationMins: { type: Number, default: 30 },
  scheduledStartUTC: { type: Date },
  scheduledEndUTC: { type: Date },
  timezoneUsed: { type: String, default: 'UTC' },
  zoom: {
    meetingId: String,
    joinUrl: String,
    startUrl: String,
    password: String,
  },
  location: { type: String },
  participants: [participantSchema],
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);
