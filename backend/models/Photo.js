import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: '', maxlength: 120 },
    alt: { type: String, default: '', maxlength: 200 },
    category: { type: String, required: true },
  },
  { timestamps: true, toJSON: jsonOptions }
);

// What the website shows: Cloudinary serves a 1200px-wide, automatically optimised version.
// A photo that has not been migrated yet simply has no url instead of crashing the gallery.
schema.virtual('url').get(function () {
  if (!this.originalUrl) return undefined;
  return this.originalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
});

export default mongoose.model('Photo', schema);