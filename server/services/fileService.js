const { query } = require("../config/database");
const { generateUniqueFilename } = require("../config/multer");

class FileService {
  // Upload file to database
  static async uploadFile(file, category, uploadedBy = null) {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    const filePath = `uploads/${category}/${uniqueFilename}`;

    const fileData = {
      original_name: file.originalname,
      filename: uniqueFilename,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.mimetype,
      category: category,
      uploaded_by: uploadedBy,
      file_data: file.buffer, // Store binary data directly
    };

    const result = await query(
      `INSERT INTO uploaded_files (original_name, filename, file_path, file_size, mime_type, category, uploaded_by, file_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        fileData.original_name,
        fileData.filename,
        fileData.file_path,
        fileData.file_size,
        fileData.mime_type,
        fileData.category,
        fileData.uploaded_by,
        fileData.file_data,
      ]
    );

    return {
      success: true,
      file: {
        id: result.rows[0].id,
        originalName: fileData.original_name,
        filename: fileData.filename,
        filePath: fileData.file_path,
        fileSize: fileData.file_size,
        mimeType: fileData.mime_type,
        category: fileData.category,
        uploadedBy: fileData.uploaded_by,
      },
    };
  }

  // Get file by ID
  static async getFileById(id) {
    const result = await query("SELECT * FROM uploaded_files WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  // Get files by category
  static async getFilesByCategory(category) {
    const result = await query(
      "SELECT * FROM uploaded_files WHERE category = $1 ORDER BY created_at DESC",
      [category]
    );
    return result.rows;
  }

  // Delete file
  static async deleteFile(id) {
    const result = await query(
      "DELETE FROM uploaded_files WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get file statistics
  static async getFileStats() {
    const stats = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size
      FROM uploaded_files 
      GROUP BY category
      ORDER BY count DESC
    `);
    return stats.rows;
  }

  // Clean up old files (for maintenance)
  static async cleanupOldFiles(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await query(
      "DELETE FROM uploaded_files WHERE created_at < $1 RETURNING id",
      [cutoffDate]
    );

    return result.rows.length;
  }

  // Get file by filename
  static async getFileByFilename(filename) {
    const result = await query(
      "SELECT * FROM uploaded_files WHERE filename = $1",
      [filename]
    );
    return result.rows[0];
  }

  // Update file metadata
  static async updateFileMetadata(id, metadata) {
    const allowedFields = ["category", "uploaded_by"];
    const updates = {};

    Object.keys(metadata).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = metadata[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update");
    }

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = Object.values(updates);
    const sql = `
      UPDATE uploaded_files 
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await query(sql, [...values, id]);
    return result.rows[0];
  }
}

module.exports = FileService;
