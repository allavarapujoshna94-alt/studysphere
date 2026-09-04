import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    fileType: { type: String, default: 'PDF' },
    author: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    file: {
      originalName: String,
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
