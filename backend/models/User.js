import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  name: { type: String },
  avatarUrl: { type: String },
  provider: { type: String, enum: ["google","github","local"], default: "local" },
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String }, // For local auth only
}, { timestamps: true });

export default mongoose.model("User", userSchema);


