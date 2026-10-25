import { Router } from 'express';
import Result from '../models/Result.js';
import Academics from '../models/Academics.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { parsePdf } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

// Public list. Teacher identity is included only for administrators.
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = {};
    for (const key of ['className', 'exam', 'academicYear']) {
      const v = str(req.query[key], 40);
      if (v) filter[key] = v;
    }
    const isAdmin = req.user?.role === 'admin';
    const results = await Result.find(filter)
      .select(isAdmin ? '-teacher' : '-teacher -teacherName')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ results });
  })
);

// Teacher's own uploads (declared before "/:id").
router.get(
  '/mine',
  authenticate,
  requireRole('teacher'),
  asyncHandler(async (req, res) => {
    const results = await Result.find({ teacher: req.user._id }).select('-teacher').sort({ createdAt: -1 });
    res.json({ results });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('teacher'),
  parsePdf('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a PDF file.');

    const className = str(req.body.className, 40);
    const subject = str(req.body.subject, 40);
    const exam = str(req.body.exam, 40);
    const academicYear = str(req.body.academicYear, 10);
    const title = str(req.body.title, 150) || `${className} – ${exam} – ${subject} (${academicYear})`;

    if (!/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');

    // Teachers may only publish for class–subject pairs they teach.
    const teaches = (req.user.assignments || []).some((a) => a.className === className && a.subject === subject);
    if (!teaches) throw new HttpError(403, 'You can upload results only for classes and subjects you teach.');

    // The exam must belong to that class's own exam pattern.
    const academics = await Academics.findOne({ key: 'main' });
    const classEntry = academics?.classes?.find((c) => c.className === className);
    if (!classEntry?.examPattern?.includes(exam)) {
      throw new HttpError(400, `"${exam}" is not in the exam pattern of ${className}.`);
    }

    // Everything is valid: now store the file.
    const stored = await uploadToCloudinary(req.file, { folder: 'results', kind: 'pdf' });
    try {
      const result = await Result.create({
        title,
        className,
        subject,
        exam,
        academicYear,
        fileUrl: stored.url,
        publicId: stored.publicId,
        fileSize: req.file.size,
        teacher: req.user._id,
        teacherName: req.user.name,
      });
      res.status(201).json({ result: await Result.findById(result._id).select('-teacher') });
    } catch (err) {
      await deleteFromCloudinary(stored.publicId);
      throw err;
    }
  })
);

router.delete(
  '/:id',
  authenticate,
  validId,
  asyncHandler(async (req, res) => {
    const result = await Result.findById(req.params.id);
    if (!result) throw new HttpError(404, 'Result not found.');

    const isAdmin = req.user.role === 'admin';
    const isOwner = result.teacher && result.teacher.equals(req.user._id);
    if (!isAdmin && !isOwner) throw new HttpError(403, 'You can delete only your own results.');

    await result.deleteOne();
    await deleteFromCloudinary(result.publicId);
    res.json({ message: 'Result deleted.' });
  })
);

export default router;