// Application constants

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const FILE_CATEGORIES = {
  GENERAL: "general",
  HERO: "hero",
  EXHIBITION: "exhibition",
  ARTIST_PROFILE: "artist_profile",
  ARTWORK: "artwork",
  GALLERY: "gallery",
  NEWSLETTER: "newsletter",
};

const EXHIBITION_STATUS = {
  UPCOMING: "upcoming",
  PAST: "past",
  CURRENT: "current",
};

const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
};

const NEWSLETTER_STATUS = {
  ACTIVE: "active",
  UNSUBSCRIBED: "unsubscribed",
  PENDING: "pending",
};

const PAGE_NAMES = {
  HOME: "home",
  ABOUT: "about",
  CONTACT: "contact",
  EXHIBITIONS: "exhibitions",
  ARTISTS: "artists",
  COLLECTION: "collection",
};

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_BIO_LENGTH: 0,
  MAX_BIO_LENGTH: 1000,
};

const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  INTERNAL_ERROR: "Internal server error",
  DATABASE_ERROR: "Database operation failed",
  FILE_UPLOAD_ERROR: "File upload failed",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File too large",
  INVALID_EMAIL: "Invalid email format",
  EMAIL_EXISTS: "Email already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",
};

const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  UPLOADED: "File uploaded successfully",
  SUBSCRIBED: "Successfully subscribed",
  UNSUBSCRIBED: "Successfully unsubscribed",
  LOGGED_IN: "Successfully logged in",
  LOGGED_OUT: "Successfully logged out",
  PASSWORD_CHANGED: "Password changed successfully",
};

const API_ENDPOINTS = {
  HEALTH: "/api/health",
  AUTH: "/api/auth",
  EXHIBITIONS: "/api/exhibitions",
  ARTISTS: "/api/artists",
  ARTWORKS: "/api/artworks",
  PAGES: "/api/page-content",
  NEWSLETTER: "/api/newsletter",
  FILES: "/api/files",
  ADMIN: {
    NEWSLETTER: "/api/admin/newsletter",
    EXHIBITIONS: "/api/admin/exhibitions",
    ARTISTS: "/api/admin/artists",
    ARTWORKS: "/api/admin/artworks",
    PAGES: "/api/admin/pages",
    FILES: "/api/admin/files",
  },
};

module.exports = {
  HTTP_STATUS,
  FILE_CATEGORIES,
  EXHIBITION_STATUS,
  USER_ROLES,
  NEWSLETTER_STATUS,
  PAGE_NAMES,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  CACHE_DURATION,
  PAGINATION,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
};
