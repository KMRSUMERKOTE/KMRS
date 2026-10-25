import { Router } from 'express';
import Activity from '../models/Activity.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parseImage } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { activityCategories } from '../config/options.js';
import { HttpError, asyncHandler, parseDate, str, validId } from '../utils/helpers.js';

const router = Router();

// Validates the text fields shared by create and edit.
function readFields(body) {
  const title = str(body.title, 120);
  const date = parseDate(str(body.date, 10));
  const category = str(body.category, 60);
  const description = str(body.description, 600);
  const link = str(body.link, 300);
  const photoAlt = str(body.photoAlt, 200);

  if (title.length < 3) throw new HttpError(400, 'Enter a title (at least 3 characters).');
  if (!date) throw new HttpError(400, 'Enter a valid date.');
  if (!activityCategories.includes(category)) throw new HttpError(400, 'Invalid category.');
  if (description.length < 10) throw new HttpError(400, 'Write a short description (at least 10 characters).');

  if (link) {
    let url = null;
    try {
      url = new URL(link);
    } catch {
      /* invalid */
    }
    if (!url || !['http:', 'https:'].includes(url.protocol)) {
      throw new HttpError(400, 'The link must start with http:// or https://.');
    }
  }

  return { title, date, category, description, link, photoAlt };
}

const ALT_MESSAGE = 'Please describe the photograph in a short sentence (alt text).';

// Public: newest activities first.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 200);
    let query = Activity.find().sort({ date: -1, createdAt: -1 });
    if (limit) query = query.limit(limit);
    res.json({ activities: await query });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parseImage('photo'), // the photo is optional
  asyncHandler(async (req, res) => {
    const fields = readFields(req.body);
    if (req.file && fields.photoAlt.length < 5) throw new HttpError(400, ALT_MESSAGE);

    const stored = req.file ? await uploadToCloudinary(req.file, { folder: 'activities', kind: 'image' }) : null;
    try {
      const activity = await Activity.create({
        title: fields.title,
        date: fields.date,
        category: fields.category,
        description: fields.description,
        link: fields.link || undefined,
        originalUrl: stored?.url,
        publicId: stored?.publicId,
        photoAlt: stored ? fields.photoAlt : undefined,
      });
      res.status(201).json({ activity });
    } catch (err) {
      await deleteFromCloudinary(stored?.publicId); // do not leave an orphan file behind
      throw err;
    }
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  parseImage('photo'),
  asyncHandler(async (req, res) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) throw new HttpError(404, 'Activity not found.');

    const fields = readFields(req.body);
    const removePhoto = req.body.removePhoto === 'true';
    const keepsPhoto = Boolean(req.file) || (Boolean(activity.originalUrl) && !removePhoto);
    if (keepsPhoto && fields.photoAlt.length < 5) throw new HttpError(400, ALT_MESSAGE);

    const oldPublicId = activity.publicId;
    const stored = req.file ? await uploadToCloudinary(req.file, { folder: 'activities', kind: 'image' }) : null;

    try {
      activity.title = fields.title;
      activity.date = fields.date;
      activity.category = fields.category;
      activity.description = fields.description;
      activity.link = fields.link || undefined;

      if (stored) {
        activity.originalUrl = stored.url;
        activity.publicId = stored.publicId;
      } else if (removePhoto) {
        activity.originalUrl = undefined;
        activity.publicId = undefined;
      }
      activity.photoAlt = keepsPhoto ? fields.photoAlt : undefined;
      await activity.save();
    } catch (err) {
      await deleteFromCloudinary(stored?.publicId);
      throw err;
    }

    // The old photo is removed only after the record has been saved successfully.
    if ((stored || removePhoto) && oldPublicId) await deleteFromCloudinary(oldPublicId);
    res.json({ activity });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) throw new HttpError(404, 'Activity not found.');
    await deleteFromCloudinary(activity.publicId);
    res.json({ message: 'Activity deleted.' });
  })
);

export default router;