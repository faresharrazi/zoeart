// Helper utility functions

const generateSlug = (text) => {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const formatDate = (date, format = "ISO") => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  switch (format) {
    case "ISO":
      return d.toISOString();
    case "date":
      return d.toISOString().split("T")[0];
    case "datetime":
      return d.toLocaleString();
    case "readable":
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    default:
      return d.toISOString();
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const generateRandomString = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

const removeEmptyValues = (obj) => {
  const cleaned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== "") {
        if (typeof value === "object" && !Array.isArray(value)) {
          const cleanedNested = removeEmptyValues(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
  }
  return cleaned;
};

const capitalizeFirst = (str) => {
  if (typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const truncateText = (text, maxLength = 100, suffix = "...") => {
  if (typeof text !== "string") return text;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

const parseJSON = (str, defaultValue = {}) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn("Failed to parse JSON:", error.message);
    return defaultValue;
  }
};

const stringifyJSON = (obj, defaultValue = "{}") => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn("Failed to stringify JSON:", error.message);
    return defaultValue;
  }
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const getFileExtension = (filename) => {
  if (typeof filename !== "string") return "";
  return filename.split(".").pop().toLowerCase();
};

const getMimeType = (filename) => {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

module.exports = {
  generateSlug,
  formatDate,
  formatFileSize,
  generateRandomString,
  deepClone,
  removeEmptyValues,
  capitalizeFirst,
  truncateText,
  parseJSON,
  stringifyJSON,
  isValidUrl,
  getFileExtension,
  getMimeType,
};
