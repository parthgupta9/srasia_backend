#!/usr/bin/env node
/**
 * Cloudinary Connection Diagnostic Test
 * Run this file to verify Cloudinary is properly configured
 */

require('dotenv').config();

console.log("🔍 Cloudinary Configuration Diagnostic");
console.log("=====================================\n");

// Check environment variables
console.log("1️⃣ Checking environment variables...");
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log(`   Cloud Name: ${cloudName ? "✅ Set" : "❌ Missing"}`);
console.log(`   API Key: ${apiKey ? "✅ Set" : "❌ Missing"}`);
console.log(`   API Secret: ${apiSecret ? "✅ Set" : "❌ Missing"}`);

if (!cloudName || !apiKey || !apiSecret) {
  console.error("\n❌ Missing Cloudinary credentials. Please check your .env file.");
  process.exit(1);
}

console.log("\n2️⃣ Testing Cloudinary SDK...");
try {
  const { v2: cloudinary } = require("cloudinary");
  const streamifier = require("streamifier");
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  
  console.log("   ✅ Cloudinary SDK loaded successfully");
  console.log(`   ✅ Configured with cloud: ${cloudName}`);
} catch (err) {
  console.error(`   ❌ Failed to load Cloudinary: ${err.message}`);
  process.exit(1);
}

// Test upload with a small file
console.log("\n3️⃣ Testing file upload...");
const { uploadToCloudinary } = require("./utils/cloudinary");

const testBuffer = Buffer.from("This is a test file");
const testFileName = "test-diagnostic.txt";

uploadToCloudinary(testBuffer, testFileName, "diagnostics")
  .then((result) => {
    console.log("   ✅ Upload successful!");
    console.log(`   📤 URL: ${result.secure_url}`);
    console.log(`   🆔 Public ID: ${result.public_id}`);
    console.log("\n✅ All tests passed! Cloudinary is working correctly.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(`   ❌ Upload failed: ${err.message}`);
    console.error("\n❌ Cloudinary upload is not working.");
    console.error("Please check:");
    console.error("1. Your internet connection");
    console.error("2. Your Cloudinary API credentials");
    console.error("3. Check Cloudinary dashboard for API restrictions");
    process.exit(1);
  });
