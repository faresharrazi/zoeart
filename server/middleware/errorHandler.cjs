// Global error handler
const errorHandler = (err, req, res, next) => {
  // Errors raised on purpose (validation, not found...) carry their own status
  // and a message that is safe to show to the user.
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : "Internal server error";

  if (err.code === "23505") {
    // PostgreSQL unique violation
    statusCode = 409;
    message = "Resource already exists";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = "Referenced resource does not exist";
  } else if (err.code === "23502") {
    // PostgreSQL not null violation
    statusCode = 400;
    message = "Required field is missing";
  } else if (err.code === "22P02") {
    // PostgreSQL invalid input syntax (e.g. "abc" where an id is expected)
    statusCode = 400;
    message = "Invalid value";
  } else if (err.code === "22001") {
    // PostgreSQL value too long for column
    statusCode = 400;
    message = "A value is too long";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request is too large";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON";
  }

  if (statusCode >= 500) {
    console.error(`Error in ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { details: err.message }),
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
