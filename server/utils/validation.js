// Input validation utilities

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    throw new Error(`${fieldName} is required`);
  }
  return true;
};

const validateStringLength = (
  value,
  fieldName,
  minLength = 1,
  maxLength = 255
) => {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length < minLength) {
    throw new Error(
      `${fieldName} must be at least ${minLength} characters long`
    );
  }
  if (value.length > maxLength) {
    throw new Error(
      `${fieldName} must be no more than ${maxLength} characters long`
    );
  }
  return true;
};

const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  if (min !== null && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must be no more than ${max}`);
  }
  return true;
};

const validateDate = (value, fieldName) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }
  return true;
};

const validateArray = (value, fieldName, itemValidator = null) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  if (itemValidator) {
    value.forEach((item, index) => {
      try {
        itemValidator(item, `${fieldName}[${index}]`);
      } catch (error) {
        throw new Error(`${fieldName}[${index}]: ${error.message}`);
      }
    });
  }
  return true;
};

const validateObject = (value, fieldName, requiredFields = []) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  requiredFields.forEach((field) => {
    if (!(field in value)) {
      throw new Error(`${fieldName} must have ${field} property`);
    }
  });
  return true;
};

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
};

const sanitizeSlug = (str) => {
  if (typeof str !== "string") return str;
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const validateFileType = (
  mimetype,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
) => {
  return allowedTypes.includes(mimetype);
};

const validateFileSize = (size, maxSize = 50 * 1024 * 1024) => {
  // 50MB default
  return size <= maxSize;
};

module.exports = {
  validateEmail,
  validateSlug,
  validateRequired,
  validateStringLength,
  validateNumber,
  validateDate,
  validateArray,
  validateObject,
  sanitizeString,
  sanitizeSlug,
  validateFileType,
  validateFileSize,
};
