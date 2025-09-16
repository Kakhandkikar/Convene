import mongoose from "mongoose";
const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  hostUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hostEmail: { type: String, lowercase: true },
  platform: { type: String },
  context: { type: String, enum: ["organizational","international"], default: "organizational" },
  organizerTimezone: { type: String },
  clientTimezone: { type: String },
  month: { type: String },        // YYYY-MM
  weekNumber: { type: Number },   // 1-4
  allowWeekends: { type: Boolean, default: false },
  allowHolidays: { type: Boolean, default: false },
  // Gemini output (store as Date for time-based checks)
  organizerTime: { type: Date },
  clientTime: { type: Date },
  reasoning: { type: String },
  status: { type: String, enum: ["scheduled","completed","cancelled"], default: "scheduled" }
}, { timestamps: true });
export default mongoose.model("Meeting", meetingSchema);
