const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload options for different image types
const uploadOptions = {
  // Default options for all uploads
  default: {
    folder: 'zoeart',
    resource_type: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  },
  
  // Options for exhibition images
  exhibition: {
    folder: 'zoeart/exhibitions',
    resource_type: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 1200, height: 800, crop: 'fill', gravity: 'auto' }
    ]
  },
  
  // Options for artwork images
  artwork: {
    folder: 'zoeart/artworks',
    resource_type: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 1000, height: 1000, crop: 'fill', gravity: 'auto' }
    ]
  },
  
  // Options for artist profile images
  artist: {
    folder: 'zoeart/artists',
    resource_type: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }
    ]
  },
  
  // Options for hero images
  hero: {
    folder: 'zoeart/hero',
    resource_type: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 1920, height: 1080, crop: 'fill', gravity: 'auto' }
    ]
  }
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadOptions_merged = { ...uploadOptions.default, ...options };
      
      // Handle file object - extract buffer for Cloudinary
      const fileBuffer = file.buffer || file;
      
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions_merged,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve({ success: false, error: error.message });
          } else {
            resolve({
              success: true,
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at
            });
          }
        }
      );
      
      // Pipe the file buffer to Cloudinary
      uploadStream.end(fileBuffer);
      
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      resolve({
        success: false,
        error: error.message
      });
    }
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to generate optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  uploadOptions
};
