import { Router } from 'express';
import Achiever from '../models/Achiever.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parseImage } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

// Public: newest achievers first.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const achievers = await Achiever.find().sort({ createdAt: -1 });
    res.json({ achievers });
  })
);

// Admin: add an achiever (photo + name + achievement text).
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parseImage('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a photograph.');
    const name = str(req.body.name, 80);
    const achievement = str(req.body.achievement, 600);
    if (name.length < 2) throw new HttpError(400, "Please enter the student's name.");
    if (achievement.length < 5) throw new HttpError(400, 'Please describe the achievement.');

    const stored = await uploadToCloudinary(req.file, { folder: 'achievers', kind: 'image' });
    try {
      const achiever = await Achiever.create({
        name,
        achievement,
        originalUrl: stored.url,
        publicId: stored.publicId,
      });
      res.status(201).json({ achiever });
    } catch (err) {
      await deleteFromCloudinary(stored.publicId); // do not leave an orphan file behind
      throw err;
    }
  })
);

// Admin: edit the name or achievement text.
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const name = str(req.body.name, 80);
    const achievement = str(req.body.achievement, 600);
    if (name.length < 2) throw new HttpError(400, "Please enter the student's name.");
    if (achievement.length < 5) throw new HttpError(400, 'Please describe the achievement.');

    const achiever = await Achiever.findByIdAndUpdate(req.params.id, { name, achievement }, { new: true });
    if (!achiever) throw new HttpError(404, 'Achiever not found.');
    res.json({ achiever });
  })
);

// Admin: delete (also removes the image from Cloudinary).
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const achiever = await Achiever.findByIdAndDelete(req.params.id);
    if (!achiever) throw new HttpError(404, 'Achiever not found.');
    await deleteFromCloudinary(achiever.publicId);
    res.json({ message: 'Achiever deleted.' });
  })
);

export default router;
