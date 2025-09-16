import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
  // Not required at creation time; populated after AI completes
  summaryText: { type: String, required: false },
  generatedAt: { type: Date, default: Date.now },
  triggerReason: { type: String, enum: ["all_submitted", "time_based", "manual"], required: true },
  status: { type: String, enum: ["generating", "completed", "failed"], default: "generating" },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  fileName: { type: String }, // Name of generated text file
  filePath: { type: String }, // Path to generated text file
}, { timestamps: true });

// Index for efficient queries
summarySchema.index({ meeting: 1, status: 1 });
summarySchema.index({ generatedAt: -1 });

export default mongoose.model("Summary", summarySchema);
