import mongoose from 'mongoose';
import { jsonOptions } from '../utils/helpers.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254 },
    phone: { type: String, maxlength: 20 },
    message: { type: String, required: true, maxlength: 1000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Enquiry', schema);