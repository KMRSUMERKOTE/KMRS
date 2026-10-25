import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

// A single document (key "main") holding, for each class, its exam pattern and subjects.
const schema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    classes: [
      {
        _id: false,
        className: { type: String, required: true, maxlength: 30 },
        examPattern: [{ type: String, maxlength: 40 }],
        subjects: [{ type: String, maxlength: 40 }],
      },
    ],
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Academics', schema);