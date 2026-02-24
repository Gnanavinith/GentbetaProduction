import express from 'express';
import { uploadImage, uploadFile } from '../services/cloudinary.service.js';

const router = express.Router();

router.post('/signature', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Base64 string is required' });
    }

    const result = await uploadImage(base64, 'signatures');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/image', async (req, res) => {
  try {
    const { base64, folder = 'uploads' } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Base64 string is required' });
    }

    const result = await uploadImage(base64, folder);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route for file uploads (PDFs, documents, etc.)
router.post('/file', async (req, res) => {
  try {
    console.log('[Upload Route] Received file upload request');
    const { base64, folder = 'submissions', fileName } = req.body;
    if (!base64) {
      console.log('[Upload Route] No base64 data provided');
      return res.status(400).json({ error: 'Base64 string is required' });
    }

    console.log('[Upload Route] Attempting to upload file to Cloudinary, folder:', folder);
    console.log('[Upload Route] Filename provided:', fileName || 'none');
    
    const result = await uploadFile(base64, folder, fileName);
    
    console.log('[Upload Route] File uploaded successfully:', {
      url: result.url,
      publicId: result.publicId,
      resourceType: result.resourceType
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Upload Route] Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;