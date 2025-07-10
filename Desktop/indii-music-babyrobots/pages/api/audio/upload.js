import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'audio_uploads');
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's body parser to allow multer to handle it
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('audioFile')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const fileUrl = `/audio_uploads/${req.file.filename}`;
      // In a real application, you would save file metadata to a database here.
      // For now, we'll just return the URL.

      res.status(200).json({ message: 'File uploaded successfully!', fileUrl });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
