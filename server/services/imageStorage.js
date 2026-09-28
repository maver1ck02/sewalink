import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/**
 * Image storage is abstracted so a cloud provider can replace local disk later.
 * Files are never stored inside MongoDB.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

export function publicImageUrl(filename) {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (env.imageStorage === 'cloud') {
    return `${process.env.IMAGE_STORAGE_URL || ''}/${filename}`;
  }
  return `/uploads/${filename}`;
}

export function fromMulterFile(file) {
  if (!file) return '';
  return publicImageUrl(file.filename);
}
