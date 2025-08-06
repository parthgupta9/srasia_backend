const express = require("express")
const multer = require("multer")
const { getJobs, addJob, deleteJob, applyToJob,downloadApplications} = require("../controller/JobController")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/jobs", getJobs)
router.post("/jobs", addJob)
router.delete("/jobs/:id", deleteJob)
router.post("/apply", upload.single("resume"), applyToJob)
router.get("/applications/download", downloadApplications)

module.exports = router
