import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    // Photo is optional. It is either a Cloudinary URL (uploaded in the admin area)
    // or a static path such as /images/classrooms/classroom-1.jpeg (facilities moved over from content.js).
    originalUrl: { type: String, trim: true },
    publicId: { type: String, trim: true }, // set only for Cloudinary uploads
    photoAlt: { type: String, default: '', maxlength: 200 },
    visible: { type: Boolean, default: true }, // false = hidden from the public website
    order: { type: Number, default: 0 }, // lowest number is shown first
  },
  { timestamps: true, toJSON: jsonOptions }
);

// What the website shows: Cloudinary photos are served as an optimised 1200px-wide version;
// static paths are used as they are.
schema.virtual('url').get(function () {
  if (!this.originalUrl) return undefined;
  if (!this.originalUrl.includes('/upload/')) return this.originalUrl;
  return this.originalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
});

export default mongoose.model('Facility', schema);
