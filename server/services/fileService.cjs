const { query } = require("../config/database.cjs");
const { generateUniqueFilename } = require("../config/multer.cjs");

// Images stored directly in Postgres (used when Cloudinary isn't configured,
// and by records created before the move to Cloudinary).
class FileService {
  static async uploadFile(file, category, uploadedBy = null) {
    const uniqueFilename = generateUniqueFilename(file.originalname);

    const result = await query(
      `INSERT INTO uploaded_files (original_name, filename, file_path, file_size, mime_type, category, uploaded_by, file_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        file.originalname,
        uniqueFilename,
        `uploads/${category}/${uniqueFilename}`,
        file.size,
        file.mimetype,
        category,
        uploadedBy,
        file.buffer,
      ]
    );

    return {
      success: true,
      file: {
        id: result.rows[0].id,
        url: `/api/files/${result.rows[0].id}`,
        originalName: file.originalname,
        filename: uniqueFilename,
        fileSize: file.size,
        mimeType: file.mimetype,
        category,
      },
    };
  }

  static async getFileById(id) {
    const result = await query("SELECT * FROM uploaded_files WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async deleteFile(id) {
    const result = await query(
      "DELETE FROM uploaded_files WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = FileService;
