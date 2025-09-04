import mongoose from "mongoose";
const meetingSchema = new mongoose.Schema({
  title: String,
  participants: [String],
  platform: String,
  context: { type: String, enum: ["organizational","international"], default: "organizational" },
  organizerTimezone: String,
  clientTimezone: String,
  month: String,        // YYYY-MM
  weekNumber: Number,   // 1-4
  allowWeekends: Boolean,
  allowHolidays: Boolean,
  // Gemini output (ISO with offsets)
  organizerTime: String,
  clientTime: String,
  reasoning: String
}, { timestamps: true });
export default mongoose.model("Meeting", meetingSchema);
