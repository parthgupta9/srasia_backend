const express = require("express")
const multer = require("multer")
const { getJobs, addJob, deleteJob, applyToJob, downloadApplications } = require("../controller/JobController")
const JobApplication = require("../models/Job");

const router = express.Router()
const upload = require("../middleware/upload");

router.get("/jobs", getJobs)
router.post("/jobs", addJob)
router.delete("/jobs/:id", deleteJob)
router.post("/apply", upload.single("resume"), applyToJob)
router.get("/applications/download", downloadApplications)

// 🔍 Debug endpoint - Check Cloudinary configuration
router.get("/debug/config", (req, res) => {
  res.json({
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
      apiKey: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
    },
    environment: process.env.NODE_ENV,
    serverURL: `${req.protocol}://${req.get('host')}`,
  });
});

// 🔍 Debug endpoint to check database records
router.get("/applications/debug/list", async (req, res) => {
  try {
    const applications = await JobApplication.find().select("name email jobTitle resume.url resume.filename resume.publicId createdAt");
    console.log("📋 Applications in database:", applications.length);
    res.json({
      totalApplications: applications.length,
      applications: applications,
      message: "All applications in database"
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Debug endpoint to check latest application
router.get("/applications/debug/latest", async (req, res) => {
  try {
    const latestApp = await JobApplication.findOne().sort({ createdAt: -1 });
    if (!latestApp) {
      return res.json({ message: "No applications found" });
    }
    console.log("📄 Latest application:", latestApp);
    res.json({
      name: latestApp.name,
      email: latestApp.email,
      jobTitle: latestApp.jobTitle,
      resume: latestApp.resume,
      createdAt: latestApp.createdAt,
      message: "Latest application from database"
    });
  } catch (err) {
    console.error("Error fetching latest application:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
