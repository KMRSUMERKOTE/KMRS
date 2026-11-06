import { Router } from 'express';
import Facility from '../models/Facility.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parseImage } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

const SORT = { order: 1, createdAt: 1 };

function readFields(body) {
  const title = str(body.title, 80);
  const description = str(body.description, 600);
  const photoAlt = str(body.photoAlt, 200);
  const visible = body.visible !== 'false' && body.visible !== false;
  if (title.length < 2) throw new HttpError(400, 'Please enter the facility name.');
  if (description.length < 10) throw new HttpError(400, 'Please write a short description (at least 10 characters).');
  return { title, description, photoAlt, visible };
}

// Public: only facilities marked as visible, in the chosen order.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 100);
    let query = Facility.find({ visible: true }).sort(SORT);
    if (limit) query = query.limit(limit);
    res.json({ facilities: await query });
  })
);

// Admin: everything, including hidden facilities.
router.get(
  '/manage',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.json({ facilities: await Facility.find().sort(SORT) });
  })
);

// Admin: add a facility (photo is optional).
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parseImage('photo'),
  asyncHandler(async (req, res) => {
    const fields = readFields(req.body);
    const last = await Facility.findOne().sort({ order: -1 }).select('order');
    const order = last ? last.order + 1 : 0;

    let stored = null;
    if (req.file) stored = await uploadToCloudinary(req.file, { folder: 'facilities', kind: 'image' });

    try {
      const facility = await Facility.create({
        ...fields,
        order,
        ...(stored ? { originalUrl: stored.url, publicId: stored.publicId } : {}),
      });
      res.status(201).json({ facility });
    } catch (err) {
      if (stored) await deleteFromCloudinary(stored.publicId); // do not leave an orphan file behind
      throw err;
    }
  })
);

// Admin: move a facility up or down in the list.
router.put(
  '/:id/move',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') throw new HttpError(400, 'Invalid direction.');

    const all = await Facility.find().sort(SORT).select('_id');
    const i = all.findIndex((f) => String(f._id) === req.params.id);
    if (i === -1) throw new HttpError(404, 'Facility not found.');

    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= all.length) return res.json({ message: 'No change.' });

    [all[i], all[j]] = [all[j], all[i]];
    await Facility.bulkWrite(
      all.map((f, index) => ({ updateOne: { filter: { _id: f._id }, update: { $set: { order: index } } } }))
    );
    res.json({ message: 'Moved.' });
  })
);

// Admin: edit details, show/hide, replace or remove the photo.
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  parseImage('photo'),
  asyncHandler(async (req, res) => {
    const facility = await Facility.findById(req.params.id);
    if (!facility) throw new HttpError(404, 'Facility not found.');

    const fields = readFields(req.body);
    const removePhoto = req.body.removePhoto === 'true';

    let stored = null;
    if (req.file) stored = await uploadToCloudinary(req.file, { folder: 'facilities', kind: 'image' });

    let oldPublicId = null;
    Object.assign(facility, fields);
    if (stored) {
      oldPublicId = facility.publicId;
      facility.originalUrl = stored.url;
      facility.publicId = stored.publicId;
    } else if (removePhoto) {
      oldPublicId = facility.publicId;
      facility.originalUrl = undefined;
      facility.publicId = undefined;
    }

    try {
      await facility.save();
    } catch (err) {
      if (stored) await deleteFromCloudinary(stored.publicId);
      throw err;
    }
    // Only photos uploaded through the admin area live on Cloudinary; static photos have no publicId.
    if (oldPublicId) await deleteFromCloudinary(oldPublicId);

    res.json({ facility });
  })
);

// Admin: delete (also removes an uploaded photo from Cloudinary).
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) throw new HttpError(404, 'Facility not found.');
    if (facility.publicId) await deleteFromCloudinary(facility.publicId);
    res.json({ message: 'Facility deleted.' });
  })
);

export default router;
