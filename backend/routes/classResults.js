import { Router } from 'express';
import ClassResult from '../models/ClassResult.js';
import Academics from '../models/Academics.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePdf } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

// Public list (read only). The administrator's identity is never sent.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    for (const key of ['className', 'exam', 'academicYear']) {
      const v = str(req.query[key], 40);
      if (v) filter[key] = v;
    }
    const results = await ClassResult.find(filter).select('-createdBy').sort({ createdAt: -1 }).limit(500);
    res.json({ results });
  })
);

// Everything below is for administrators only. Teachers cannot reach these routes.
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parsePdf('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a PDF file.');

    const className = str(req.body.className, 40);
    const exam = str(req.body.exam, 40);
    const academicYear = str(req.body.academicYear, 10);
    const title = str(req.body.title, 150) || `${className} – ${exam} – Marks List (${academicYear})`;

    if (!className) throw new HttpError(400, 'Select a class.');
    if (!/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');

    // The examination must belong to that class's own exam pattern.
    const academics = await Academics.findOne({ key: 'main' });
    const classEntry = academics?.classes?.find((c) => c.className === className);
    if (!classEntry?.examPattern?.includes(exam)) {
      throw new HttpError(400, `"${exam}" is not in the exam pattern of ${className}.`);
    }

    // Everything is valid: now store the file.
    const stored = await uploadToCloudinary(req.file, { folder: 'marks-lists', kind: 'pdf' });
    try {
      const result = await ClassResult.create({
        title,
        className,
        exam,
        academicYear,
        fileUrl: stored.url,
        publicId: stored.publicId,
        fileSize: req.file.size,
        createdBy: req.user._id,
      });
      res.status(201).json({ result: await ClassResult.findById(result._id).select('-createdBy') });
    } catch (err) {
      await deleteFromCloudinary(stored.publicId);
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
    const result = await ClassResult.findById(req.params.id);
    if (!result) throw new HttpError(404, 'Marks list not found.');

    await result.deleteOne();
    await deleteFromCloudinary(result.publicId);
    res.json({ message: 'Marks list deleted.' });
  })
);

export default router;
