// Configuration file for Aether Art Space
// Copy this to config.js and update with your actual values

module.exports = {
  // Database Configuration
  database: {
    host: "localhost",
    user: "your_database_username",
    password: "your_database_password",
    database: "your_database_name",
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: "production",
  },

  // JWT Secret (change this to a secure random string)
  jwtSecret: "your_super_secure_jwt_secret_here",

  // Admin Credentials (change these)
  admin: {
    username: "admin",
    password: "admin123",
  },
};
