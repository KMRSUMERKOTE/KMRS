import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '..');
export const UPLOADS_DIR = path.join(ROOT, 'uploads');
export const FRONTEND_DIST = path.resolve(ROOT, '..', 'frontend', 'dist');