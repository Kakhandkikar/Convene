import mongoose from "mongoose";

const retrospectiveSchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, lowercase: true },
  content: { type: String, required: true },
  scores: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

retrospectiveSchema.index({ meeting: 1, participant: 1 }, { unique: true });

export default mongoose.model("Retrospective", retrospectiveSchema);


