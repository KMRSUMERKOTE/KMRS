import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['teacher', 'admin'], required: true },
    active: { type: Boolean, default: true },

    // Teacher profile (private: only the teacher and admins can see these)
    profilePic: {
      _id: false,
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    },
    staffType: { type: String, enum: ['teaching', 'non-teaching'] },
    designation: { type: String, trim: true, maxlength: 60 },
    designationOther: { type: String, trim: true, maxlength: 60 },
    qualifications: [{ type: String, maxlength: 20 }],
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, trim: true, maxlength: 20 },
    experienceYears: Number,
    assignments: [
      {
        _id: false,
        className: { type: String, required: true, maxlength: 40 },
        subject: { type: String, required: true, maxlength: 40 },
      },
    ],
  },
  { timestamps: true, toJSON: { ...jsonOptions, transform: (d, ret) => { delete ret.id; delete ret.passwordHash; return ret; } } }
);

export default mongoose.model('User', schema);