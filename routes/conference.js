const express = require("express");
const { addConference, getAllConferences } = require("../controller/Conference");

const router = express.Router();

// Admin route to add conference
router.post("/admin", addConference);

// Public route to get all
router.get("/api/conferences", getAllConferences);

module.exports = router;
