import multer from 'multer';
import { HttpError } from '../utils/helpers.js';

const MAX_MB = 5;

const ALLOWED = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b);

// Check the file's real content, not just the name or the type the browser claims.
const MAGIC = {
  pdf: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]), // %PDF
  image: (b) =>
    startsWith(b, [0xff, 0xd8, 0xff]) || // JPEG
    startsWith(b, [0x89, 0x50, 0x4e, 0x47]) || // PNG
    (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8)), // WebP
};

const verifyMagic = (kind) => (req, res, next) => {
  if (!req.file) return next();
  if (MAGIC[kind](req.file.buffer.subarray(0, 12))) return next();
  next(new HttpError(400, 'The file content does not match its type.'));
};

// The file stays in memory. Routes send it to Cloudinary only after all validation passes.
function build(kind, field) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1, fields: 20, fieldSize: 10 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED[kind].includes(file.mimetype)) return cb(null, true);
      cb(new HttpError(400, kind === 'pdf' ? 'Only PDF files are allowed.' : 'Only JPG, PNG or WebP images are allowed.'));
    },
  });
  return [upload.single(field), verifyMagic(kind)];
}

export const parsePdf = (field = 'file') => build('pdf', field);
export const parseImage = (field = 'photo') => build('image', field);
export { MAX_MB };