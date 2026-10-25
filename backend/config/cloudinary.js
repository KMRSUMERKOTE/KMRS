import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../utils/helpers.js';

let configured = false;

// Configured lazily so the .env file is always loaded first.
const configure = () => {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
};

// Uploads a file held in memory (req.file.buffer). kind: 'image' | 'pdf'.
// PDFs are stored as Cloudinary "image" resources so they open directly in the browser.
export function uploadToCloudinary(file, { folder, kind }) {
  configure();

  const options = {
    folder: `kmrs/${folder}`,
    resource_type: 'image',
    use_filename: false,
    unique_filename: true,
    overwrite: false,
    allowed_formats: kind === 'pdf' ? ['pdf'] : ['jpg', 'png', 'webp'],
    ...(kind === 'image'
      ? { transformation: [{ width: 2000, height: 2000, crop: 'limit' }, { quality: 'auto' }] }
      : {}),
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        console.error('Cloudinary upload failed:', error?.message || error);
        return reject(new HttpError(502, 'The file could not be saved. Please try again.'));
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(file.buffer);
  });
}

// Never throws: a failed cleanup must not break the request that triggered it.
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.error(`Could not delete ${publicId} from Cloudinary:`, err.message);
  }
}