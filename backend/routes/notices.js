import { Router } from 'express';
import Notice from '../models/Notice.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePdf } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { noticeCategories } from '../config/options.js';
import { HttpError, asyncHandler, parseDate, str, validId } from '../utils/helpers.js';

const router = Router();

// When the home page asks for a `limit` (its "latest notices" preview), expired notices are left out.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 200);
    const filter = limit ? { $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }] } : {};
    let query = Notice.find(filter).sort({ publishedAt: -1, createdAt: -1 });
    if (limit) query = query.limit(limit);
    res.json({ notices: await query });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parsePdf('file'), // the PDF is optional
  asyncHandler(async (req, res) => {
    const title = str(req.body.title, 150);
    const category = str(req.body.category, 60);
    const academicYear = str(req.body.academicYear, 10);
    const publishedAt = parseDate(str(req.body.publishedAt, 10));
    const expiresRaw = str(req.body.expiresAt, 10);
    const expiresAt = expiresRaw ? parseDate(expiresRaw, true) : undefined;

    if (title.length < 3) throw new HttpError(400, 'Enter a title (at least 3 characters).');
    if (!noticeCategories.includes(category)) throw new HttpError(400, 'Invalid category.');
    if (academicYear && !/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');
    if (!publishedAt) throw new HttpError(400, 'Enter a valid publication date.');
    if (expiresRaw && !expiresAt) throw new HttpError(400, 'Enter a valid expiry date.');
    if (expiresAt && expiresAt < publishedAt) throw new HttpError(400, 'Expiry cannot be before the publication date.');

    const stored = req.file ? await uploadToCloudinary(req.file, { folder: 'notices', kind: 'pdf' }) : null;
    try {
      const notice = await Notice.create({
        title,
        category,
        academicYear: academicYear || undefined,
        refNo: str(req.body.refNo, 60) || undefined,
        description: str(req.body.description, 400) || undefined,
        publishedAt,
        expiresAt,
        fileUrl: stored?.url,
        publicId: stored?.publicId,
        fileSize: req.file?.size,
      });
      res.status(201).json({ notice });
    } catch (err) {
      await deleteFromCloudinary(stored?.publicId);
      throw err;
    }
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) throw new HttpError(404, 'Notice not found.');
    await deleteFromCloudinary(notice.publicId);
    res.json({ message: 'Notice deleted.' });
  })
);

export default router;