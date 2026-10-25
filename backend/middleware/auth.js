import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/helpers.js';

const userFromRequest = async (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
  const user = await User.findById(payload.id);
  return user && user.active ? user : null;
};

// Login required.
export const authenticate = asyncHandler(async (req, res, next) => {
  const user = await userFromRequest(req);
  if (!user) throw new HttpError(401, 'Please log in to continue.');
  req.user = user;
  next();
});

// Public route that behaves differently for logged-in admins.
export const optionalAuth = async (req, res, next) => {
  try {
    req.user = await userFromRequest(req);
  } catch {
    req.user = null;
  }
  next();
};

export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : next(new HttpError(403, 'You do not have permission to do this.'));