import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { UPLOADS_DIR } from '../config/paths.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Moves files uploaded before the Cloudinary switch (backend/uploads/*) to Cloudinary
// and updates their database records. Safe to run more than once.
const TARGETS = [
  { collection: 'photos', folder: 'gallery', kind: 'image', urlField: 'originalUrl' },
  { collection: 'results', folder: 'results', kind: 'pdf', urlField: 'fileUrl' },
  { collection: 'notices', folder: 'notices', kind: 'pdf', urlField: 'fileUrl' },
  { collection: 'disclosures', folder: 'disclosures', kind: 'pdf', urlField: 'fileUrl' },
];

async function main() {
  for (const key of ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[key]) throw new Error(`${key} is missing in .env`);
  }
  await mongoose.connect(process.env.MONGO_URI);

  let moved = 0;
  let missing = 0;
  let failed = 0;

  for (const t of TARGETS) {
    // Native collection access: the new models no longer know about the old "fileName" field.
    const col = mongoose.connection.collection(t.collection);
    const docs = await col
      .find({ fileName: { $exists: true, $ne: null }, [t.urlField]: { $exists: false } })
      .toArray();
    console.log(`${t.collection}: ${docs.length} to migrate`);

    for (const doc of docs) {
      const filePath = path.join(UPLOADS_DIR, t.folder, path.basename(doc.fileName));

      let buffer;
      try {
        buffer = await fs.readFile(filePath);
      } catch {
        console.log(`  MISSING file on disk: ${filePath}`);
        missing += 1;
        continue;
      }

      try {
        const stored = await uploadToCloudinary({ buffer }, { folder: t.folder, kind: t.kind });
        await col.updateOne(
          { _id: doc._id },
          { $set: { [t.urlField]: stored.url, publicId: stored.publicId }, $unset: { fileName: '' } }
        );
        moved += 1;
        console.log(`  ok: ${doc.fileName}`);
      } catch (err) {
        failed += 1;
        console.log(`  FAILED: ${doc.fileName} (${err.message})`);
      }
    }
  }

  console.log(`\nDone. Migrated: ${moved}, missing on disk: ${missing}, failed: ${failed}.`);
  if (missing || failed) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(`\nError: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());