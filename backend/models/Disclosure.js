import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    section: { type: String, enum: ['B', 'C', 'D', 'E'], required: true },
    docType: { type: String, required: true },
    title: { type: String, required: true, maxlength: 150 },
    documentDate: Date,
    academicYear: { type: String, match: /^\d{4}-\d{2}$/ },
    validUntil: Date,
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: Number,
    fileType: { type: String, default: 'pdf' },
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Disclosure', schema);