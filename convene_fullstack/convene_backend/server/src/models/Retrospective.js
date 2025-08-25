import mongoose from 'mongoose';

const retroSchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentHtml: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Retrospective', retroSchema);
