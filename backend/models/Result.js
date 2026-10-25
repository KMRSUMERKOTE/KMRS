import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    className: { type: String, required: true, maxlength: 40 },
    subject: { type: String, required: true, maxlength: 40 },
    exam: { type: String, required: true, maxlength: 40 },
    academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: Number,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherName: String,
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Result', schema);