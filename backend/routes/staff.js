import { Router } from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// Public: only fields that are safe to publish. No email, phone, age or gender.
const publicView = (u) => ({
  _id: u._id,
  name: u.name,
  photo: u.profilePic?.url || '',
  staffType: u.staffType,
  designation: u.designation,
  title: u.designation === 'Others' ? u.designationOther || 'Staff' : u.designation,
  qualifications: u.qualifications || [],
  experienceYears: u.experienceYears,
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const staff = await User.find({
      role: 'teacher',
      active: true,
      staffType: { $in: ['teaching', 'non-teaching'] },
      designation: { $exists: true, $ne: '' },
    })
      .select('name profilePic staffType designation designationOther qualifications experienceYears')
      .sort({ name: 1 });
    res.json({ staff: staff.map(publicView) });
  })
);

export default router;