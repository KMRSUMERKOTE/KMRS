import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

export const ALL_CLASSES = 'All Classes';
export const ALL_SUBJECTS = 'All Subjects';
export const KINDS = ['Question Bank', 'Previous Year Questions'];

// A question bank / previous-year question paper (PDF) uploaded by an administrator.
// It can be for one class or for All Classes, and for one subject or All Subjects (combined papers).
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    kind: { type: String, required: true, enum: KINDS },
    className: { type: String, required: true, maxlength: 40 }, // a class name or "All Classes"
    subject: { type: String, required: true, maxlength: 40 }, // a subject or "All Subjects"
    academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: jsonOptions }
);

schema.index({ className: 1, subject: 1, academicYear: 1 });

export default mongoose.model('QuestionBank', schema);
