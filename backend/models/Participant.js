import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true, lowercase: true },
  name: { type: String },
  role: { type: String, enum: ["host","participant"], default: "participant" },
  joinedAt: { type: Date },
  invitedAt: { type: Date },
}, { timestamps: true });

participantSchema.index({ meeting: 1, email: 1 }, { unique: true });

export default mongoose.model("Participant", participantSchema);


