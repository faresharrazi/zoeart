const multer = require("multer");
const crypto = require("crypto");

// Configure multer for file uploads (memory storage for Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit (Vercel default limit)
  },
  fileFilter: (req, file, cb) => {
    console.log(
      "File filter called for:",
      file.originalname,
      "MIME type:",
      file.mimetype
    );
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.log("File rejected - not an image");
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  return `${crypto.randomUUID()}-${originalname}`;
};

// Validate file type
const validateFileType = (mimetype) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  return allowedTypes.includes(mimetype);
};

// Get file category from request
const getFileCategory = (req) => {
  const category = req.body.category || "general";
  
  // Map common category names to database enum values
  const categoryMapping = {
    "hero": "hero_image",
    "hero_image": "hero_image", 
    "artwork": "artwork",
    "artist": "artist_profile",
    "artist_profile": "artist_profile",
    "exhibition": "exhibition",
    "gallery": "gallery",
    "general": "gallery" // fallback to gallery for general files
  };
  
  return categoryMapping[category] || "gallery";
};

// File upload error handler
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        error: "File too large. Maximum size is 4MB." 
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ 
        error: "Unexpected field name for file upload." 
      });
    }
  }
  
  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ 
      error: "Only image files are allowed." 
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  generateUniqueFilename,
  validateFileType,
  getFileCategory,
  handleUploadError,
};
