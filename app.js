const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

const dataDir = path.join(__dirname, 'data');
const jsonPath = path.join(dataDir, 'images.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(jsonPath)) fs.writeFileSync(jsonPath, '[]');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + unique + ext);
    }
  });
  const upload = multer({ storage });

  function loadImages() {
    return JSON.parse(fs.readFileSync(jsonPath));
  }
  function saveImages(imgs) {
    fs.writeFileSync(jsonPath, JSON.stringify(imgs, null, 2));
  }

  app.get('/', (req, res) => {
    const images = loadImages();
    res.render('index', { images });
  });
  
  app.get('/upload', (req, res) => {
    res.render('upload');
  });
  
  app.post('/upload', upload.array('photos', 5), (req, res) => {
    const images = loadImages();
    req.files.forEach(file => {
      images.push({
        filename: file.filename,
        original: file.originalname,
        uploadDate: new Date().toISOString()
      });
    });
    saveImages(images);
    res.redirect('/');
  });
  
  app.get('/gallery', (req, res) => {
    const images = loadImages();
    res.render('gallery', { images });
  });
  
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));