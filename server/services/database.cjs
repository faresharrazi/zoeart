const { query } = require("../config/database.cjs");

// Generic CRUD operations
class DatabaseService {
  // Get all records from a table
  static async findAll(tableName, conditions = {}, orderBy = "id") {
    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(" AND ");
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    sql += ` ORDER BY ${orderBy}`;

    const result = await query(sql, params);
    return result.rows;
  }

  // Find one record by ID
  static async findById(tableName, id) {
    const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [
      id,
    ]);
    return result.rows[0];
  }

  // Find one record by conditions
  static async findOne(tableName, conditions) {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(" AND ");

    const sql = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
    const params = Object.values(conditions);

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Create a new record
  static async create(tableName, data) {
    const columns = Object.keys(data);
    const values = Object.values(data).map(value => {
      // Handle JSON fields - stringify arrays and objects
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return JSON.stringify(value);
      }
      return value;
    });
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const sql = `
      INSERT INTO ${tableName} (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update a record by ID
  static async update(tableName, id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data).map(value => {
      // Handle JSON fields - stringify arrays and objects
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return JSON.stringify(value);
      }
      return value;
    });
    const setClause = columns
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const sql = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $${columns.length + 1}
      RETURNING *
    `;

    const result = await query(sql, [...values, id]);
    return result.rows[0];
  }

  // Delete a record by ID
  static async delete(tableName, id) {
    const result = await query(
      `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Count records
  static async count(tableName, conditions = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(" AND ");
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  // Execute raw SQL
  static async execute(sql, params = []) {
    const result = await query(sql, params);
    return result.rows;
  }
}

// Specific service methods for common operations
class ExhibitionService {
  static async getAll() {
    return DatabaseService.findAll("exhibitions", {}, "created_at DESC");
  }

  static async getById(id) {
    return DatabaseService.findById("exhibitions", id);
  }

  static async create(data) {
    return DatabaseService.create("exhibitions", data);
  }

  static async update(id, data) {
    return DatabaseService.update("exhibitions", id, data);
  }

  static async delete(id) {
    return DatabaseService.delete("exhibitions", id);
  }

  static async toggleVisibility(id, isVisible) {
    return DatabaseService.update("exhibitions", id, { is_visible: isVisible });
  }
}

class ArtistService {
  static async getAll() {
    return DatabaseService.findAll("artists", {}, "name ASC");
  }

  static async findVisible() {
    return DatabaseService.findAll("artists", { is_visible: true }, "name ASC");
  }

  static async getById(id) {
    return DatabaseService.findById("artists", id);
  }

  static async create(data) {
    return DatabaseService.create("artists", data);
  }

  static async update(id, data) {
    return DatabaseService.update("artists", id, data);
  }

  static async delete(id) {
    return DatabaseService.delete("artists", id);
  }
}

class ArtworkService {
  static async getAll() {
    return DatabaseService.findAll("artworks", {}, "created_at DESC");
  }

  static async getById(id) {
    return DatabaseService.findById("artworks", id);
  }

  static async create(data) {
    return DatabaseService.create("artworks", data);
  }

  static async update(id, data) {
    return DatabaseService.update("artworks", id, data);
  }

  static async delete(id) {
    return DatabaseService.delete("artworks", id);
  }
}

class NewsletterService {
  static async getAll() {
    return DatabaseService.findAll(
      "newsletter_subscribers",
      {},
      "subscribed_at DESC"
    );
  }

  static async getById(id) {
    return DatabaseService.findById("newsletter_subscribers", id);
  }

  static async findOne(table, conditions) {
    return DatabaseService.findOne(table, conditions);
  }

  static async create(data) {
    return DatabaseService.create("newsletter_subscribers", data);
  }

  static async delete(id) {
    return DatabaseService.delete("newsletter_subscribers", id);
  }
}

module.exports = {
  DatabaseService,
  ExhibitionService,
  ArtistService,
  ArtworkService,
  NewsletterService,
};
