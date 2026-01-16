const express = require("express");
const router = express.Router();
const { createProposal } = require("../controller/ProposalController");

router.post("/", createProposal);

module.exports = router;
