import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Express 4 does not catch async errors on its own.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Always returns a trimmed string (or '' for non-strings). Also defeats NoSQL-injection objects.
export const str = (v, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const isEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Parses "YYYY-MM-DD". Expiry-style dates run to the end of that day.
export const parseDate = (v, endOfDay = false) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(d.getTime()) || !d.toISOString().startsWith(v)) return null;
  return d;
};

export const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : next(new HttpError(404, 'Not found.'));

// Shared JSON output options. Cloudinary's internal public_id is never sent to browsers.
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.id;
    delete ret.publicId;
    return ret;
  },
};