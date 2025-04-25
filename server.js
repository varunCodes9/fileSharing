// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 10000;

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all file types
  }
});

// Routes
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname
  });
});

app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).send('Error reading files');
    res.json(files.reverse().map(file => ({
      name: file,
      url: `/download/${encodeURIComponent(file)}`
    })));
  });
});

app.get('/download/:file', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.file);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});