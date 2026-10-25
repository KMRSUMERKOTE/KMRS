import { Router } from 'express';
import User from '../models/User.js';
import Result from '../models/Result.js';
import Photo from '../models/Photo.js';
import Notice from '../models/Notice.js';
import Disclosure from '../models/Disclosure.js';
import Enquiry from '../models/Enquiry.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const [teachers, results, photos, notices, disclosures, enquiries, unreadEnquiries] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      Result.countDocuments(),
      Photo.countDocuments(),
      Notice.countDocuments(),
      Disclosure.countDocuments(),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ read: false }),
    ]);
    res.json({ teachers, results, photos, notices, disclosures, enquiries, unreadEnquiries });
  })
);

export default router;