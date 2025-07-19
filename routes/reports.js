const express = require("express");
const {
  addReport,
  getReports,
  deleteReport,
  updateReport,
} = require("../controller/Reports");

const router = express.Router();

router.post("/admin/reports", addReport);
router.get("/api/reports", getReports);
router.delete("/admin/reports/:id", deleteReport);
router.put("/admin/reports/:id", updateReport);

module.exports = router;
