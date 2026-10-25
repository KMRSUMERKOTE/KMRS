import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { HttpError, asyncHandler, isEmail, str } from '../utils/helpers.js';

const router = Router();

// Compared against when the email does not exist, so response time does not reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = str(req.body.email, 254).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!isEmail(email) || !password) throw new HttpError(400, 'Please enter your email and password.');

    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password.slice(0, 200), user?.passwordHash || DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Incorrect email or password.');
    if (!user.active) throw new HttpError(403, 'This account has been disabled. Please contact the administrator.');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' });
    res.json({ token, user: publicUser(user) });
  })
);

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

router.put(
  '/change-password',
  authenticate,
  asyncHandler(async (req, res) => {
    const current = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const next = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';
    if (next.length < 8 || next.length > 72) throw new HttpError(400, 'The new password must be 8 to 72 characters.');

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await bcrypt.compare(current, user.passwordHash))) {
      throw new HttpError(400, 'Your current password is incorrect.');
    }
    if (current === next) throw new HttpError(400, 'The new password must be different from the current one.');

    user.passwordHash = await bcrypt.hash(next, 12);
    await user.save();
    res.json({ message: 'Password changed.' });
  })
);

export default router;