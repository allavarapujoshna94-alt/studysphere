import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import requireAuth from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const allowedExtensions = new Set(['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 80);
    cb(null, `${Date.now()}-${safeBase}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
      return cb(new Error('Unsupported file type. Use PDF, DOC/DOCX, PPT/PPTX, JPG, PNG or WEBP.'));
    }
    cb(null, true);
  },
});

function safeDelete(file) {
  if (!file?.filename) return;
  const filePath = path.join(uploadDir, file.filename);
  fs.unlink(filePath, () => {});
}

function handleUploadError(err, res) {
  if (!err) return false;
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'File is too large. Maximum size is 25MB.' });
  } else {
    res.status(400).json({ message: err.message || 'File upload failed.' });
  }
  return true;
}

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', sort = 'newest' } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      views_desc: { views: -1, createdAt: -1 },
      title_asc: { title: 1 },
    };

    const notes = await Note.find(filter).sort(sortMap[sort] || sortMap.newest).lean();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes.', error: err.message });
  }
});

// GET /api/notes/mine
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your notes.', error: err.message });
  }
});

// GET /api/notes/:id/file
router.get('/:id/file', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid note ID.' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (!note.file?.filename) return res.status(404).json({ message: 'This note has no file attached.' });

    const filePath = path.join(uploadDir, note.file.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Attached file is no longer available.' });

    res.setHeader('Cache-Control', 'no-store');
    res.download(filePath, note.file.originalName || note.file.filename, (downloadErr) => {
      if (downloadErr && !res.headersSent) {
        res.status(500).json({ message: 'Failed to send the file.', error: downloadErr.message });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to download file.', error: err.message });
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid note ID.' });
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch note.', error: err.message });
  }
});

// POST /api/notes
router.post('/', requireAuth, (req, res) => {
  console.log('=== UPLOAD START ===');
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);

  upload.single('file')(req, res, async (uploadErr) => {
    console.log('UPLOAD ERROR:', uploadErr);
    console.log('REQ FILE:', req.file);
    console.log('REQ BODY:', req.body);

    if (handleUploadError(uploadErr, res)) return;
    try {
      const { title, category, description, fileType } = req.body;
      if (!title?.trim() || !category?.trim() || !description?.trim()) {
        if (req.file) safeDelete(req.file);
        return res.status(400).json({ message: 'Title, category, and description are required.' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'Please select a file to upload.' });
      }

      const note = await Note.create({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        fileType: fileType || path.extname(req.file.originalname).replace('.', '').toUpperCase(),
        author: req.user.name,
        uploadedBy: req.user.id,
        
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });

      res.status(201).json(note);
    } catch (err) {
      if (req.file) safeDelete(req.file);
      res.status(500).json({ message: 'Failed to create note.', error: err.message });
    }
  });
});

// PUT /api/notes/:id
router.put('/:id', requireAuth, (req, res) => {
  upload.single('file')(req, res, async (uploadErr) => {
    if (handleUploadError(uploadErr, res)) return;
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        if (req.file) safeDelete(req.file);
        return res.status(400).json({ message: 'Invalid note ID.' });
      }
      const note = await Note.findById(req.params.id);
      if (!note) {
        if (req.file) safeDelete(req.file);
        return res.status(404).json({ message: 'Note not found.' });
      }
      if (String(note.uploadedBy) !== String(req.user.id)) {
        if (req.file) safeDelete(req.file);
        return res.status(403).json({ message: 'You can only edit your own notes.' });
      }

      const { title, category, description, fileType } = req.body;
      if (!title?.trim() || !category?.trim() || !description?.trim()) {
        if (req.file) safeDelete(req.file);
        return res.status(400).json({ message: 'Title, category, and description are required.' });
      }

      note.title = title.trim();
      note.category = category.trim();
      note.description = description.trim();
      note.fileType = fileType || note.fileType;

      if (req.file) {
        safeDelete(note.file);
        note.file = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        };
        note.fileType = fileType || path.extname(req.file.originalname).replace('.', '').toUpperCase();
      }

      await note.save();
      res.json(note);
    } catch (err) {
      if (req.file) safeDelete(req.file);
      res.status(500).json({ message: 'Failed to update note.', error: err.message });
    }
  });
});

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid note ID.' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (String(note.uploadedBy) !== String(req.user.id)) return res.status(403).json({ message: 'You can only delete your own notes.' });

    safeDelete(note.file);
    await note.deleteOne();
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note.', error: err.message });
  }
});

export default router;
