const express = require("express");
const router = express.Router();
const inquiryController = require("../controller/inquiryController");

router.post("/", inquiryController.createInquiry);
router.get("/", inquiryController.getAllInquiries);
router.delete("/:id", inquiryController.deleteInquiry);

module.exports = router;
