const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../contacts.xlsx");

// 📌 Contact form submission
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body;

    console.log("Contact form submitted:", req.body);

    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Contacts"];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "Email", "Phone", "Organization", "Subject", "Message", "Date"],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([
      name,
      email,
      phone,
      organization,
      subject,
      message,
      new Date().toLocaleString(),
    ]);

    worksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Contacts"] = worksheet;
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ message: "Message received and saved to Excel!" });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ error: "Failed to submit message." });
  }
});

// 📌 Download contacts Excel
router.get("/contact/download", (req, res) => {
  if (fs.existsSync(filePath)) {
    res.download(filePath, "contacts.xlsx");
  } else {
    res.status(404).json({ error: "No contacts file found" });
  }
});

module.exports = router;
