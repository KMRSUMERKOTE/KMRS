import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Enquiry from '../models/Enquiry.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler, isEmail, str, validId } from '../utils/helpers.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
});

// Public: send an enquiry.
router.post(
  '/',
  submitLimiter,
  asyncHandler(async (req, res) => {
    // Honeypot: real visitors never fill this. Pretend success so bots learn nothing.
    if (str(req.body.website, 100)) return res.status(201).json({ message: 'Received.' });

    const name = str(req.body.name, 80);
    const email = str(req.body.email, 254).toLowerCase();
    const phone = str(req.body.phone, 20);
    const message = str(req.body.message, 1000);

    if (name.length < 2) throw new HttpError(400, 'Please enter your name.');
    if (!isEmail(email)) throw new HttpError(400, 'Please enter a valid email address.');
    if (phone && !/^[+\d][\d\s-]{7,14}$/.test(phone)) throw new HttpError(400, 'Please enter a valid phone number.');
    if (message.length < 10) throw new HttpError(400, 'Please write at least 10 characters.');

    await Enquiry.create({ name, email, phone: phone || undefined, message });
    res.status(201).json({ message: 'Received.' });
  })
);

// Admin: read and manage enquiries.
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.json({ enquiries: await Enquiry.find().sort({ createdAt: -1 }).limit(500) });
  })
);

router.put(
  '/:id/read',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!enquiry) throw new HttpError(404, 'Enquiry not found.');
    res.json({ enquiry });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) throw new HttpError(404, 'Enquiry not found.');
    res.json({ message: 'Enquiry deleted.' });
  })
);

export default router;