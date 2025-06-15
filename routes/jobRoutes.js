const express = require("express")
const multer = require("multer")
const { getJobs, addJob, deleteJob, applyToJob } = require("../controller/JobController")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/jobs", getJobs)
router.post("/jobs", addJob)
router.delete("/jobs/:id", deleteJob)
router.post("/apply", upload.single("resume"), applyToJob)

module.exports = router
