const express = require("express");
const { signInAdmin } = require("../controller/AdminAuthController");

const router = express.Router();

router.post("/signin", signInAdmin);

module.exports = router;
