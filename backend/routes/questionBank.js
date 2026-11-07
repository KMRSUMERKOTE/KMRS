import { Router } from 'express';
import QuestionBank, { ALL_CLASSES, ALL_SUBJECTS, KINDS } from '../models/QuestionBank.js';
import Academics from '../models/Academics.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePdf } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

// Public list (read only). The administrator's identity is never sent.
// A student filtering by Class VIII / Math also sees papers made for "All Classes" / "All Subjects".
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};

    const className = str(req.query.className, 40);
    if (className) filter.className = { $in: [className, ALL_CLASSES] };

    const subject = str(req.query.subject, 40);
    if (subject) filter.subject = { $in: [subject, ALL_SUBJECTS] };

    const academicYear = str(req.query.academicYear, 10);
    if (academicYear) filter.academicYear = academicYear;

    const kind = str(req.query.kind, 40);
    if (kind) filter.kind = kind;

    const items = await QuestionBank.find(filter).select('-createdBy').sort({ createdAt: -1 }).limit(500);
    res.json({ items });
  })
);

// Everything below is for administrators only.
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parsePdf('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a PDF file.');

    const kind = str(req.body.kind, 40);
    const className = str(req.body.className, 40);
    const subject = str(req.body.subject, 40);
    const academicYear = str(req.body.academicYear, 10);
    const title = str(req.body.title, 150) || `${kind} – ${className} – ${subject} (${academicYear})`;

    if (!KINDS.includes(kind)) throw new HttpError(400, 'Select the type of paper.');
    if (!className) throw new HttpError(400, 'Select a class.');
    if (!subject) throw new HttpError(400, 'Select a subject.');
    if (!/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');

    // The class and subject must exist in the admin-managed academics settings.
    const academics = await Academics.findOne({ key: 'main' });
    const classes = academics?.classes || [];
    let allowedSubjects;
    if (className === ALL_CLASSES) {
      allowedSubjects = new Set(classes.flatMap((c) => c.subjects || []));
    } else {
      const entry = classes.find((c) => c.className === className);
      if (!entry) throw new HttpError(400, `"${className}" is not a configured class.`);
      allowedSubjects = new Set(entry.subjects || []);
    }
    if (subject !== ALL_SUBJECTS && !allowedSubjects.has(subject)) {
      throw new HttpError(400, `"${subject}" is not a subject of ${className}.`);
    }

    // Everything is valid: now store the file.
    const stored = await uploadToCloudinary(req.file, { folder: 'question-bank', kind: 'pdf' });
    try {
      const item = await QuestionBank.create({
        title,
        kind,
        className,
        subject,
        academicYear,
        fileUrl: stored.url,
        publicId: stored.publicId,
        fileSize: req.file.size,
        createdBy: req.user._id,
      });
      res.status(201).json({ item: await QuestionBank.findById(item._id).select('-createdBy') });
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
    const item = await QuestionBank.findById(req.params.id);
    if (!item) throw new HttpError(404, 'Question bank entry not found.');

    await item.deleteOne();
    await deleteFromCloudinary(item.publicId);
    res.json({ message: 'Question bank entry deleted.' });
  })
);

export default router;
