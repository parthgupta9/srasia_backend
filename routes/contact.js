const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Path to store Excel file
const filePath = path.join(__dirname, "../contacts.xlsx");

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body;

    // Log to console (existing behavior)
    console.log("Contact form submitted:", req.body);

    // ===== Excel Save Logic =====
    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      // Read existing file
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Contacts"];
    } else {
      // Create new workbook & sheet with headers
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "Email", "Phone", "Organization", "Subject", "Message"]
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    }

    // Convert existing sheet to array, append new row
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([name, email, phone, organization, subject, message]);

    // Convert array back to sheet and save
    worksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Contacts"] = worksheet;
    XLSX.writeFile(workbook, filePath);

    // Respond success
    res.status(200).json({ message: "Message received and saved to Excel!" });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ error: "Failed to submit message." });
  }
});

module.exports = router;
