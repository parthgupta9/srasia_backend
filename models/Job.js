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
      mimetype: String,
      size: Number,
      data: Buffer, // store resume file
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
