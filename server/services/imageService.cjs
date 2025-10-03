const { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } = require('../config/cloudinary.cjs');
const db = require('./database.cjs');

class ImageService {
  constructor() {
    this.useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET;
  }

  // Check if an image URL is from Cloudinary
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
  }

  // Extract public_id from Cloudinary URL
  extractPublicId(url) {
    if (!this.isCloudinaryUrl(url)) return null;
    
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Reconstruct public_id with folder path
    const folderIndex = parts.findIndex(part => part === 'zoeart');
    if (folderIndex !== -1) {
      const folderParts = parts.slice(folderIndex, -1);
      return folderParts.join('/') + '/' + publicId;
    }
    
    return publicId;
  }

  // Upload image (Cloudinary or database)
  async uploadImage(file, options = {}) {
    if (this.useCloudinary) {
      return await this.uploadToCloudinary(file, options);
    } else {
      return await this.uploadToDatabase(file, options);
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(file, options = {}) {
    try {
      const result = await uploadToCloudinary(file, options);
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          source: 'cloudinary'
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      // Fallback to database upload
      return await this.uploadToDatabase(file, options);
    }
  }

  // Upload to database (legacy method)
  async uploadToDatabase(file, options = {}) {
    try {
      const { originalname, buffer, mimetype, size } = file;
      
      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}-${originalname}`;
      
      // Insert into database
      const result = await db.query(
        `INSERT INTO uploaded_files (original_name, filename, file_data, file_size, mime_type, category, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          originalname,
          filename,
          buffer,
          size,
          mimetype,
          options.category || 'general',
          options.uploadedBy || 'system'
        ]
      );

      const fileId = result.rows[0].id;
      
      return {
        success: true,
        url: `/api/files/${fileId}`,
        id: fileId,
        filename: filename,
        originalName: originalname,
        fileSize: size,
        mimeType: mimetype,
        source: 'database'
      };
    } catch (error) {
      console.error('Database upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get image URL (handles both Cloudinary and database images)
  getImageUrl(imageData) {
    if (typeof imageData === 'string') {
      // If it's already a URL, return as is
      return imageData;
    }
    
    if (imageData && imageData.url) {
      return imageData.url;
    }
    
    if (imageData && imageData.id) {
      // Database image
      return `/api/files/${imageData.id}`;
    }
    
    return null;
  }

  // Get optimized image URL (Cloudinary only)
  getOptimizedImageUrl(imageData, options = {}) {
    if (this.isCloudinaryUrl(this.getImageUrl(imageData))) {
      const publicId = this.extractPublicId(this.getImageUrl(imageData));
      if (publicId) {
        return getOptimizedUrl(publicId, options);
      }
    }
    
    // Fallback to regular URL
    return this.getImageUrl(imageData);
  }

  // Delete image (Cloudinary or database)
  async deleteImage(imageData) {
    if (this.isCloudinaryUrl(this.getImageUrl(imageData))) {
      return await this.deleteFromCloudinary(imageData);
    } else {
      return await this.deleteFromDatabase(imageData);
    }
  }

  // Delete from Cloudinary
  async deleteFromCloudinary(imageData) {
    try {
      const publicId = this.extractPublicId(this.getImageUrl(imageData));
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }
      
      const result = await deleteFromCloudinary(publicId);
      return {
        success: result.success,
        source: 'cloudinary'
      };
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete from database
  async deleteFromDatabase(imageData) {
    try {
      if (imageData && imageData.id) {
        await db.query('DELETE FROM uploaded_files WHERE id = $1', [imageData.id]);
        return {
          success: true,
          source: 'database'
        };
      }
      
      throw new Error('Invalid image data');
    } catch (error) {
      console.error('Database delete failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Migrate image from database to Cloudinary
  async migrateToCloudinary(imageData, options = {}) {
    try {
      if (imageData && imageData.id) {
        // Get image data from database
        const result = await db.query(
          'SELECT file_data, mime_type, original_name FROM uploaded_files WHERE id = $1',
          [imageData.id]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Image not found in database');
        }
        
        const { file_data, mime_type, original_name } = result.rows[0];
        
        // Create file-like object for Cloudinary
        const file = {
          originalname: original_name,
          buffer: file_data,
          mimetype: mime_type,
          size: file_data.length
        };
        
        // Upload to Cloudinary
        const cloudinaryResult = await this.uploadToCloudinary(file, options);
        
        if (cloudinaryResult.success) {
          // Update database record with Cloudinary URL
          await db.query(
            'UPDATE uploaded_files SET url = $1, cloudinary_public_id = $2 WHERE id = $3',
            [cloudinaryResult.url, cloudinaryResult.public_id, imageData.id]
          );
          
          return {
            success: true,
            cloudinaryUrl: cloudinaryResult.url,
            publicId: cloudinaryResult.public_id,
            originalId: imageData.id
          };
        } else {
          throw new Error(cloudinaryResult.error);
        }
      }
      
      throw new Error('Invalid image data');
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ImageService();
