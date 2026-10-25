import multer from 'multer';
import { MAX_MB } from './upload.js';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found.' });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? `The file must be smaller than ${MAX_MB} MB.` : 'The upload was not accepted.';
    return res.status(400).json({ message });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'That value already exists.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request.' });
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'Some of the information provided is not valid.' });
  }

  console.error(err); // details stay on the server
  res.status(500).json({ message: 'Something went wrong on the server.' });
};