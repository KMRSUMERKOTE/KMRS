import { Router } from 'express';
import ClassResult from '../models/ClassResult.js';
import Academics from '../models/Academics.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler, str, validId } from '../utils/helpers.js';

const router = Router();

const MAX_STUDENTS = 300;
const MAX_TOTAL = 10000;

const toNumber = (v) =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '') ? Number(v) : NaN;
const round2 = (n) => Math.round(n * 100) / 100;

// Validates and cleans the student rows. Throws a readable error naming the row.
function cleanStudents(raw) {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'Add at least one student.');
  if (raw.length > MAX_STUDENTS) {
    throw new HttpError(400, `A marks list can have at most ${MAX_STUDENTS} students.`);
  }

  const seen = new Set();
  return raw.map((s, i) => {
    const row = i + 1;
    const name = str(s?.name, 80);
    const totalMarks = toNumber(s?.totalMarks);
    const marksSecured = toNumber(s?.marksSecured);

    if (!name) throw new HttpError(400, `Row ${row}: enter the student's name.`);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0 || totalMarks > MAX_TOTAL) {
      throw new HttpError(400, `Row ${row} (${name}): enter valid total marks.`);
    }
    if (!Number.isFinite(marksSecured) || marksSecured < 0) {
      throw new HttpError(400, `Row ${row} (${name}): enter valid marks secured.`);
    }
    if (marksSecured > totalMarks) {
      throw new HttpError(400, `Row ${row} (${name}): marks secured cannot exceed total marks.`);
    }

    // Two students may share a name, so only an identical repeated row is rejected.
    const key = `${name.toLowerCase()}|${totalMarks}|${marksSecured}`;
    if (seen.has(key)) throw new HttpError(400, `Row ${row} (${name}) repeats an earlier row.`);
    seen.add(key);

    return { name, totalMarks: round2(totalMarks), marksSecured: round2(marksSecured) };
  });
}

// Validates the whole request body. `existing` is the saved list when editing.
async function cleanBody(body, existing) {
  const className = str(body?.className, 40);
  const exam = str(body?.exam, 40);
  const academicYear = str(body?.academicYear, 10);

  if (!className) throw new HttpError(400, 'Select a class.');
  if (!exam) throw new HttpError(400, 'Select the examination category.');
  if (!/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');

  const students = cleanStudents(body?.students);

  // The category must belong to that class's own exam pattern. An unchanged class and
  // category on an existing list is left alone, so old lists stay editable after the
  // exam pattern changes.
  const unchanged = existing && existing.className === className && existing.exam === exam;
  if (!unchanged) {
    const academics = await Academics.findOne({ key: 'main' });
    const classEntry = academics?.classes?.find((c) => c.className === className);
    if (!classEntry?.examPattern?.includes(exam)) {
      throw new HttpError(400, `"${exam}" is not in the exam pattern of ${className}.`);
    }
  }

  const title = str(body?.title, 150) || `${className} – ${exam} – Marks List (${academicYear})`;
  return { title, className, exam, academicYear, students };
}

// Public list (read only). The admin's identity is never sent.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    for (const key of ['className', 'exam', 'academicYear']) {
      const v = str(req.query[key], 40);
      if (v) filter[key] = v;
    }
    const results = await ClassResult.find(filter).select('-createdBy').sort({ createdAt: -1 }).limit(100);
    res.json({ results });
  })
);

// Everything below is for administrators only. Teachers cannot reach these routes.
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const data = await cleanBody(req.body);
    const created = await ClassResult.create({ ...data, createdBy: req.user._id });
    res.status(201).json({ result: await ClassResult.findById(created._id).select('-createdBy') });
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const existing = await ClassResult.findById(req.params.id);
    if (!existing) throw new HttpError(404, 'Marks list not found.');

    const data = await cleanBody(req.body, existing);
    existing.set(data);
    await existing.save();
    res.json({ result: await ClassResult.findById(existing._id).select('-createdBy') });
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
    res.json({ message: 'Marks list deleted.' });
  })
);

export default router;
