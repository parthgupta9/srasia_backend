const express = require("express");
const router = express.Router();
const { createFeedback } = require("../controller/Feedback");

router.post("/", createFeedback);

module.exports = router;
