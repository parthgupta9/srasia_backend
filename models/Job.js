const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    previousOrganization: String,

    highestQualification: String,
    experience: Number,
    expectedCtc: Number,
    jobTitle: { type: String, required: true },

    resume: {
      filename: String,
      url: String, // Cloudinary URL
      publicId: String, // Cloudinary public ID for deletion
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
