import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

// A marks list (PDF) for one class and one examination category, uploaded by an administrator.
// Teachers cannot create these (see routes/classResults.js).
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    className: { type: String, required: true, maxlength: 40 },
    exam: { type: String, required: true, maxlength: 40 }, // the category, e.g. "Half Yearly"
    academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: jsonOptions }
);

schema.index({ className: 1, exam: 1, academicYear: 1 });

export default mongoose.model('ClassResult', schema);
