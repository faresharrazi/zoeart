const {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadOptions,
} = require("../config/cloudinary.cjs");
const FileService = require("./fileService.cjs");

// Cloudinary folder options for each upload category (see multer getFileCategory)
const CLOUDINARY_OPTIONS_BY_CATEGORY = {
  exhibition: uploadOptions.exhibition,
  artwork: uploadOptions.artwork,
  artist_profile: uploadOptions.artist,
  hero_image: uploadOptions.hero,
};

// Images stored in Postgres are referenced as /api/files/<id> (older records
// use /api/file/<id>).
const DATABASE_FILE_URL = /^\/api\/files?\/(\d+)$/;

class ImageService {
  get useCloudinary() {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
  }

  isCloudinaryUrl(url) {
    return typeof url === "string" && url.includes("res.cloudinary.com/");
  }

  // Public id of an asset in this site's own Cloudinary account, or null.
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/zoeart/artworks/abc.jpg
  //      -> zoeart/artworks/abc
  extractPublicId(url) {
    if (!this.isCloudinaryUrl(url)) return null;
    const match = url.match(
      /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:.*?\/)?(zoeart\/[^?#]+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i
    );
    if (!match || match[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null;
    return match[2];
  }

  // Uploads to Cloudinary when configured, otherwise stores the file in
  // Postgres (local development).
  async uploadImage(file, { category, uploadedBy }) {
    if (!this.useCloudinary) {
      const result = await FileService.uploadFile(file, category, uploadedBy);
      return {
        success: true,
        url: `/api/files/${result.file.id}`,
        id: result.file.id,
        source: "database",
      };
    }

    const result = await uploadToCloudinary(
      file,
      CLOUDINARY_OPTIONS_BY_CATEGORY[category] || uploadOptions.default
    );
    if (!result.success) {
      throw new Error(result.error || "Cloudinary upload failed");
    }
    return {
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      source: "cloudinary",
    };
  }

  // Deletes an image the site uploaded, given the URL stored on a record.
  // URLs pointing anywhere else are ignored.
  async deleteImage(url) {
    if (!url || typeof url !== "string") return false;

    const fileMatch = url.match(DATABASE_FILE_URL);
    if (fileMatch) {
      return Boolean(await FileService.deleteFile(Number(fileMatch[1])));
    }

    const publicId = this.extractPublicId(url);
    if (publicId && this.useCloudinary) {
      const result = await deleteFromCloudinary(publicId);
      return result.success;
    }
    return false;
  }

  // Deletes every image in `urls`, logging (not throwing) failures so a
  // record deletion never fails because of image cleanup.
  async deleteImages(urls) {
    const unique = [...new Set((urls || []).filter(Boolean))];
    await Promise.all(
      unique.map((url) =>
        this.deleteImage(url).catch((error) =>
          console.error(`Failed to delete image ${url}:`, error.message)
        )
      )
    );
  }
}

module.exports = new ImageService();
