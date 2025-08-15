const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use user id and timestamp for unique filename
    const userId = req.body.userId || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/avatar/upload
router.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the relative path for frontend usage
  const relativePath = `/uploads/${req.file.filename}`;
  res.json({ path: relativePath });
});

module.exports = router;
