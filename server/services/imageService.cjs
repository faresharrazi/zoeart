const {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadOptions,
} = require("../config/cloudinary.cjs");
const FileService = require("./fileService.cjs");
const { query } = require("../config/database.cjs");

// Cloudinary folder options for each upload category (see multer getFileCategory)
const CLOUDINARY_OPTIONS_BY_CATEGORY = {
  exhibition: uploadOptions.exhibition,
  artwork: uploadOptions.artwork,
  artist_profile: uploadOptions.artist,
  hero_image: uploadOptions.hero,
  partner: uploadOptions.partner,
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

    // Cloudinary assets are only deleted by the production API: a local copy
    // of the site can point at the same Cloudinary account with a different
    // database, where "unused" would be wrong.
    const publicId = this.extractPublicId(url);
    if (
      publicId &&
      this.useCloudinary &&
      process.env.NODE_ENV === "production"
    ) {
      const result = await deleteFromCloudinary(publicId);
      return result.success;
    }
    return false;
  }

  // True if any record still uses this image URL.
  async isReferenced(url) {
    const { rows } = await query(
      `SELECT EXISTS (
         SELECT 1 FROM exhibitions WHERE featured_image = $1 OR gallery_images @> jsonb_build_array($1::text)
         UNION ALL SELECT 1 FROM artworks WHERE featured_image = $1 OR images @> jsonb_build_array($1::text)
         UNION ALL SELECT 1 FROM artists WHERE profile_image = $1
         UNION ALL SELECT 1 FROM hero_images WHERE cloudinary_url = $1
         UNION ALL SELECT 1 FROM partners WHERE logo_url = $1
         UNION ALL SELECT 1 FROM articles WHERE featured_image = $1 OR position($1 in content) > 0
         UNION ALL SELECT 1 FROM about_blocks WHERE position($1 in content) > 0
       ) AS used`,
      [url]
    );
    return rows[0].used;
  }

  // Deletes the images in `urls` that no record uses any more. Call it after
  // the record itself was deleted or updated. Failures are logged, not thrown,
  // so saving a record never fails because of image cleanup.
  async deleteUnusedImages(urls) {
    const unique = [...new Set((urls || []).filter(Boolean))];
    await Promise.all(
      unique.map(async (url) => {
        try {
          if (!(await this.isReferenced(url))) {
            await this.deleteImage(url);
          }
        } catch (error) {
          console.error(`Failed to delete image ${url}:`, error.message);
        }
      })
    );
  }

  // Image URLs used by a record of any content type.
  imageUrlsOf(record) {
    if (!record) return [];
    const list = (value) => (Array.isArray(value) ? value : []);
    return [
      record.featured_image,
      record.profile_image,
      ...list(record.gallery_images),
      ...list(record.images),
    ].filter((url) => typeof url === "string" && url);
  }

  // Images a record used before an update that it no longer uses.
  removedImageUrls(before, after) {
    const kept = new Set(this.imageUrlsOf(after));
    return this.imageUrlsOf(before).filter((url) => !kept.has(url));
  }
}

module.exports = new ImageService();
