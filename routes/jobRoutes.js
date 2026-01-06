const express = require("express");
const {
  getJobs,
  addJob,
  deleteJob,
  applyToJob,
  downloadApplications,
} = require("../controller/JobController");

const upload = require("../middlewares/upload");

const router = express.Router();

router.get("/jobs", getJobs);
router.post("/jobs", addJob);
router.delete("/jobs/:id", deleteJob);

// IMPORTANT: "resume" must match frontend input name
router.post("/apply", upload.single("resume"), applyToJob);

router.get("/applications/download", downloadApplications);

module.exports = router;
