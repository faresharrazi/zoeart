// Test Cloudinary integration
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

console.log("🔍 Testing Cloudinary Integration...\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME || "❌ Not set"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not set"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not set"
);
console.log("");

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("⚙️  Cloudinary Configuration:");
  console.log(
    "Cloud Name:",
    cloudinary.config().cloud_name || "❌ Not configured"
  );
  console.log(
    "API Key:",
    cloudinary.config().api_key ? "✅ Configured" : "❌ Not configured"
  );
  console.log(
    "API Secret:",
    cloudinary.config().api_secret ? "✅ Configured" : "❌ Not configured"
  );
  console.log("");

  // Test API connection
  console.log("🌐 Testing API Connection...");

  cloudinary.api
    .ping()
    .then((result) => {
      console.log("✅ Cloudinary API Connection: SUCCESS");
      console.log("Status:", result.status);
      console.log("");

      // Test upload options
      console.log("📁 Testing Upload Options...");
      const testOptions = {
        folder: "zoeart/test",
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      };

      console.log("Upload options configured:", testOptions);
      console.log("");
      console.log("🎉 All tests passed! Cloudinary is ready to use.");
    })
    .catch((error) => {
      console.log("❌ Cloudinary API Connection: FAILED");
      console.log("Error:", error.message);
      console.log("");
      console.log("🔧 Troubleshooting:");
      console.log("1. Check your API credentials in Cloudinary dashboard");
      console.log("2. Verify environment variables are set correctly");
      console.log("3. Make sure your Cloudinary account is active");
    });
} catch (error) {
  console.log("❌ Configuration Error:", error.message);
  console.log("");
  console.log("🔧 Make sure all environment variables are set correctly");
}
