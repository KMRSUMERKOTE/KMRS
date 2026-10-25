import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Academics from '../models/Academics.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler, isEmail, str, validId } from '../utils/helpers.js';

const router = Router();
const GENDERS = ['Male', 'Female', 'Other'];

const view = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  active: u.active,
  age: u.age,
  gender: u.gender,
  phone: u.phone,
  experienceYears: u.experienceYears,
  assignments: u.assignments || [],
});

// ---------- Teacher: own profile (declared before "/:id" routes) ----------
router.get('/me', authenticate, requireRole('teacher'), (req, res) => res.json({ teacher: view(req.user) }));

router.put(
  '/me',
  authenticate,
  requireRole('teacher'),
  asyncHandler(async (req, res) => {
    const name = str(req.body.name, 80);
    const age = Number(req.body.age);
    const gender = str(req.body.gender, 10);
    const phone = str(req.body.phone, 20);
    const exp = Number(req.body.experienceYears);

    if (name.length < 2) throw new HttpError(400, 'Please enter your full name.');
    if (!Number.isInteger(age) || age < 18 || age > 70) throw new HttpError(400, 'Age must be between 18 and 70.');
    if (!GENDERS.includes(gender)) throw new HttpError(400, 'Please select a gender.');
    if (!/^[+\d][\d\s-]{7,14}$/.test(phone)) throw new HttpError(400, 'Please enter a valid contact number.');
    if (!Number.isInteger(exp) || exp < 0 || exp > 50) throw new HttpError(400, 'Experience must be 0 to 50 whole years.');

    Object.assign(req.user, { name, age, gender, phone, experienceYears: exp });
    await req.user.save();
    res.json({ teacher: view(req.user) });
  })
);

router.put(
  '/me/classes',
  authenticate,
  requireRole('teacher'),
  asyncHandler(async (req, res) => {
    const raw = Array.isArray(req.body.assignments) ? req.body.assignments : null;
    if (!raw || raw.length > 60) throw new HttpError(400, 'Invalid list of classes.');

    const academics = await Academics.findOne({ key: 'main' });
    const allowed = new Set((academics?.classes || []).flatMap((c) => c.subjects.map((s) => `${c.className}\u0000${s}`)));
    const existing = new Set((req.user.assignments || []).map((a) => `${a.className}\u0000${a.subject}`));

    const seen = new Set();
    const clean = [];
    for (const a of raw) {
      const className = str(a?.className, 40);
      const subject = str(a?.subject, 40);
      const key = `${className}\u0000${subject}`;
      if (!className || !subject) throw new HttpError(400, 'Each entry needs a class and a subject.');
      if (seen.has(key)) continue;
      seen.add(key);
      // New entries must exist in the school's class list; entries already saved may stay.
      if (!allowed.has(key) && !existing.has(key)) {
        throw new HttpError(400, `${className} – ${subject} is not in the school's class and subject list.`);
      }
      clean.push({ className, subject });
    }

    req.user.assignments = clean;
    await req.user.save();
    res.json({ teacher: view(req.user) });
  })
);

// ---------- Admin: manage teachers ----------
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const teachers = await User.find({ role: 'teacher' }).sort({ name: 1 });
    res.json({ teachers: teachers.map(view) });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const name = str(req.body.name, 80);
    const email = str(req.body.email, 254).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2) throw new HttpError(400, 'Enter the teacher\'s name.');
    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Password must be 8 to 72 characters.');
    if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists.');

    const teacher = await User.create({ name, email, role: 'teacher', passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ teacher: view(teacher) });
  })
);

router.put(
  '/:id/password',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const pw = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';
    if (pw.length < 8 || pw.length > 72) throw new HttpError(400, 'Password must be 8 to 72 characters.');
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
    if (!teacher) throw new HttpError(404, 'Teacher not found.');
    teacher.passwordHash = await bcrypt.hash(pw, 12);
    await teacher.save();
    res.json({ message: 'Password reset.' });
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    if (typeof req.body.active !== 'boolean') throw new HttpError(400, 'Invalid request.');
    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher' },
      { active: req.body.active },
      { new: true }
    );
    if (!teacher) throw new HttpError(404, 'Teacher not found.');
    res.json({ teacher: view(teacher) });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validId,
  asyncHandler(async (req, res) => {
    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: 'teacher' });
    if (!teacher) throw new HttpError(404, 'Teacher not found.');
    res.json({ message: 'Teacher deleted.' });
  })
);

export default router;