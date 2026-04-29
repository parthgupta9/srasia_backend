const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

// Verify environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary environment variables not set!");
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✓ Cloudinary configured with cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {String} fileName - Original file name
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise} Cloudinary upload response
 */
const uploadToCloudinary = (fileBuffer, fileName, folder = "resumes") => {
  return new Promise((resolve, reject) => {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        console.error("❌ File buffer is empty");
        return reject(new Error("File buffer is empty"));
      }

      console.log(`📁 Uploading file: ${fileName} to folder: ${folder}`);
      console.log(`   File size: ${fileBuffer.length} bytes`);
      
  const publicId = `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`;
      console.log(`   Public ID: ${publicId}`);
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "raw",
          public_id: publicId,
          timeout: 60000,
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary callback error:", error);
            reject(error);
          } else {
            console.log("✅ File successfully uploaded to Cloudinary");
            console.log(`   URL: ${result.secure_url}`);
            console.log(`   Public ID: ${result.public_id}`);
            resolve(result);
          }
        }
      );

      // Handle stream errors
      uploadStream.on("error", (error) => {
        console.error("❌ Upload stream error:", error.message);
        reject(error);
      });

      // Create and pipe the read stream
      const readStream = streamifier.createReadStream(fileBuffer);
      
      readStream.on("error", (error) => {
        console.error("❌ Read stream error:", error.message);
        reject(error);
      });

      readStream.on("end", () => {
        console.log("✓ Read stream ended");
      });

      readStream.pipe(uploadStream);
    } catch (err) {
      console.error("❌ Unexpected upload error:", err);
      reject(err);
    }
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the file
 * @returns {Promise} Cloudinary deletion response
 */
const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
