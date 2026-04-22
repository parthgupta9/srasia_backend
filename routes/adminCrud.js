const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const {
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controller/AdminCrudController");

const router = express.Router();

router.use(adminAuth);

router.get("/:resource", listRecords);
router.get("/:resource/:id", getRecordById);
router.post("/:resource", createRecord);
router.put("/:resource/:id", updateRecord);
router.delete("/:resource/:id", deleteRecord);

module.exports = router;
