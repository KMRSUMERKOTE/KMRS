import { Router } from 'express';
import Academics from '../models/Academics.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler, str } from '../utils/helpers.js';

const router = Router();

const unique = (list) => new Set(list.map((x) => x.toLowerCase())).size === list.length;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const doc = await Academics.findOne({ key: 'main' });
    res.json({ classes: doc?.classes || [] });
  })
);

router.put(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body.classes) || req.body.classes.length > 20) {
      throw new HttpError(400, 'Invalid list of classes.');
    }

    const classes = req.body.classes.map((c) => ({
      className: str(c?.className, 30),
      examPattern: Array.isArray(c?.examPattern) ? c.examPattern.slice(0, 12).map((e) => str(e, 40)) : [],
      subjects: Array.isArray(c?.subjects) ? c.subjects.slice(0, 30).map((s) => str(s, 40)) : [],
    }));

    if (classes.some((c) => !c.className)) throw new HttpError(400, 'Class names cannot be empty.');
    if (!unique(classes.map((c) => c.className))) throw new HttpError(400, 'Class names must be unique.');

    for (const c of classes) {
      if (c.examPattern.length === 0) throw new HttpError(400, `${c.className} needs at least one examination.`);
      if (c.examPattern.some((e) => !e)) throw new HttpError(400, `${c.className} has an empty exam name.`);
      if (!unique(c.examPattern)) throw new HttpError(400, `${c.className} has a repeated examination.`);
      if (c.subjects.length === 0) throw new HttpError(400, `${c.className} needs at least one subject.`);
      if (c.subjects.some((s) => !s)) throw new HttpError(400, `${c.className} has an empty subject name.`);
      if (!unique(c.subjects)) throw new HttpError(400, `${c.className} has a repeated subject.`);
    }

    const doc = await Academics.findOneAndUpdate(
      { key: 'main' },
      { classes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ classes: doc.classes });
  })
);

export default router;