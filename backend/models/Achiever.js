import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    achievement: { type: String, required: true, trim: true, maxlength: 600 },
    originalUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true, toJSON: jsonOptions }
);

// What the website shows: Cloudinary serves a 900px-wide, automatically optimised version.
schema.virtual('url').get(function () {
  if (!this.originalUrl) return undefined;
  return this.originalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_900,c_limit/');
});

export default mongoose.model('Achiever', schema);
