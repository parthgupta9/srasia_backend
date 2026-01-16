const express = require("express");
const router = express.Router();
const { createComplaint } = require("../controller/ComplaintController");

router.post("/", createComplaint);

module.exports = router;
