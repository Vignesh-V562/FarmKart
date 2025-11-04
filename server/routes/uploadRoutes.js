const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFileToFirebase } = require('../utils/firebaseUpload'); // Import Firebase upload utility

const router = express.Router();

// Configure multer to store files in memory as a buffer
const upload = multer({ storage: multer.memoryStorage() });

// Generic file upload route to Firebase
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    const publicUrl = await uploadFileToFirebase(req.file);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Firebase upload error:', error);
    res.status(500).json({ message: 'Failed to upload file to Firebase' });
  }
});

module.exports = router;