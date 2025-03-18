import multer from 'multer';
import path from 'path';

// File filter to allow only jpg, png, jpeg formats
const fileFilter = (req, file, cb) => {
  // Check allowed extensions
  const allowedFileTypes = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG and PNG image files are allowed!'), false);
  }
};

// multer config
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + Math.floor(Math.random() * 1000000) + '_' + file.fieldname + ext);
  }
});

// Set file size limits (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Create multer instances with file filter and size limits
const upload = multer({
  storage,
  fileFilter,
  limits
});

export const profileMulter = upload.single('profile');
export const brandMulter = upload.single('brand');
export const productMulter = upload.array('product', 10);

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        errorMessage: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      errorMessage: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      errorMessage: err.message || 'File upload failed'
    });
  }

  // No error occurred, continue
  next();
};
