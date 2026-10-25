import { Router } from 'express';
import Disclosure from '../models/Disclosure.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePdf } from '../middleware/upload.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { disclosureSections } from '../config/options.js';
import { HttpError, asyncHandler, parseDate, str, validId } from '../utils/helpers.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ items: await Disclosure.find().sort({ section: 1, documentDate: -1, createdAt: -1 }) });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  parsePdf('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Please choose a PDF file.');

    const section = str(req.body.section, 1);
    const docType = str(req.body.docType, 60);
    const title = str(req.body.title, 150);
    const academicYear = str(req.body.academicYear, 10);
    const docDateRaw = str(req.body.documentDate, 10);
    const validRaw = str(req.body.validUntil, 10);
    const documentDate = docDateRaw ? parseDate(docDateRaw) : undefined;
    const validUntil = validRaw ? parseDate(validRaw, true) : undefined;

    if (!disclosureSections[section]?.includes(docType)) throw new HttpError(400, 'Invalid section or document type.');
    if (title.length < 3) throw new HttpError(400, 'Enter a document title.');
    if (academicYear && !/^\d{4}-\d{2}$/.test(academicYear)) throw new HttpError(400, 'Invalid academic year.');
    if (docDateRaw && !documentDate) throw new HttpError(400, 'Invalid document date.');
    if (validRaw && !validUntil) throw new HttpError(400, 'Invalid validity date.');
    if (documentDate && validUntil && validUntil < documentDate) {
      throw new HttpError(400, 'Validity cannot end before the document date.');
    }

    const stored = await uploadToCloudinary(req.file, { folder: 'disclosures', kind: 'pdf' });
    try {
      const item = await Disclosure.create({
        section,
        docType,
        title,
        academicYear: academicYear || undefined,
        documentDate,
        validUntil,
        fileUrl: stored.url,
        publicId: stored.publicId,
        fileSize: req.file.size,
      });
      res.status(201).json({ item });
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
    const item = await Disclosure.findByIdAndDelete(req.params.id);
    if (!item) throw new HttpError(404, 'Document not found.');
    await deleteFromCloudinary(item.publicId);
    res.json({ message: 'Document removed.' });
  })
);

export default router;