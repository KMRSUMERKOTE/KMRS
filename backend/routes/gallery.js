import { Router } from 'express';
import Photo from '../models/Photo.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parseImage } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { galleryCategories } from '../config/options.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 200);
    let query = Photo.find().sort({ createdAt: 1 });
    if (limit) query = query.limit(limit);
    res.json({ photos: await query });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parseImage('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a photograph.');
    const category = str(req.body.category, 60);
    if (!galleryCategories.includes(category)) throw new HttpError(400, 'Invalid category.');

    const stored = await uploadToCloudinary(req.file, { folder: 'gallery', kind: 'image' });
    try {
      const photo = await Photo.create({ originalUrl: stored.url, publicId: stored.publicId, category });
      res.status(201).json({ photo });
    } catch (err) {
      await deleteFromCloudinary(stored.publicId); // do not leave an orphan file behind
      throw err;
    }
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const category = str(req.body.category, 60);
    if (!galleryCategories.includes(category)) throw new HttpError(400, 'Invalid category.');

    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption: str(req.body.caption, 120), alt: str(req.body.alt, 200), category },
      { new: true }
    );
    if (!photo) throw new HttpError(404, 'Photograph not found.');
    res.json({ photo });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) throw new HttpError(404, 'Photograph not found.');
    await deleteFromCloudinary(photo.publicId);
    res.json({ message: 'Photograph deleted.' });
  })
);

export default router;