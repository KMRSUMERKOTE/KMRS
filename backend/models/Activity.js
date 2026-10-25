import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true, maxlength: 600 },
    link: { type: String, maxlength: 300 },
    // Optional single photograph, stored on Cloudinary
    originalUrl: String,
    publicId: String,
    photoAlt: { type: String, maxlength: 200 },
  },
  { timestamps: true, toJSON: jsonOptions }
);

// What the website shows: a 1000px-wide, automatically optimised version.
schema.virtual('photoUrl').get(function () {
  if (!this.originalUrl) return undefined;
  return this.originalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1000,c_limit/');
});

export default mongoose.model('Activity', schema);