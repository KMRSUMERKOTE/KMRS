import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { FRONTEND_DIST } from './config/paths.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import academicsRoutes from './routes/academics.js';
import resultRoutes from './routes/results.js';
import classResultRoutes from './routes/classResults.js';
import galleryRoutes from './routes/gallery.js';
import noticeRoutes from './routes/notices.js';
import disclosureRoutes from './routes/disclosures.js';
import activityRoutes from './routes/activities.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import staffRoutes from './routes/staff.js';

const isProd = process.env.NODE_ENV === 'production';

// Fail early on missing or unsafe configuration.
const missing = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(
  (key) => !process.env[key]
);
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

const app = express();
if (isProd) app.set('trust proxy', 1); // correct client IPs behind a reverse proxy

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
        'upgrade-insecure-requests': isProd ? [] : null,
      },
    },
  })
);

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '100kb' }));

app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/class-results', classResultRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/disclosures', disclosureRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

app.use('/api', notFound);

// In production, serve the built frontend from this same server.
if (isProd && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
}

app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
