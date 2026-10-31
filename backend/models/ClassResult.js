import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

// One student's line in a marks list: no subjects, only the overall figures.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    totalMarks: { type: Number, required: true, min: 1, max: 10000 },
    marksSecured: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(v) {
          return v <= this.totalMarks;
        },
        message: 'Marks secured cannot exceed total marks.',
      },
    },
  },
  { _id: false, id: false }
);

// A published marks list for one class and one examination category.
// Only administrators create, edit or delete these (see routes/classResults.js).
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 150 },
    className: { type: String, required: true, maxlength: 40 },
    exam: { type: String, required: true, maxlength: 40 }, // the category, e.g. "Half Yearly"
    academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    students: { type: [studentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: jsonOptions }
);

schema.index({ className: 1, exam: 1, academicYear: 1 });

export default mongoose.model('ClassResult', schema);
