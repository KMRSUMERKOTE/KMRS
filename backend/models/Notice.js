import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    category: { type: String, required: true },
    academicYear: { type: String, match: /^\d{4}-\d{2}$/ },
    refNo: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 400 },
    publishedAt: { type: Date, required: true },
    expiresAt: Date,
    fileUrl: String, // optional PDF attachment
    publicId: String,
    fileSize: Number,
    fileType: { type: String, default: 'pdf' },
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Notice', schema);