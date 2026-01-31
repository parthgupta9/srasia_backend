const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../contacts.xlsx");

/* ==========================
   📌 CONTACT FORM SUBMIT
   ========================== */
router.post("/", async (req, res) => {
  try {
    console.log("📩 RAW BODY:", req.body);

    const {
      name = "",
      email = "",
      phone = "",
      organization = "",
      subject = "",
      message = "",
    } = req.body;

    // Required validation (AMP-safe)
    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let workbook;
    let worksheet;

    // Load or create workbook
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Contacts"];
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Create sheet if missing
    if (!worksheet) {
      worksheet = XLSX.utils.aoa_to_sheet([
        [
          "Name",
          "Email",
          "Phone",
          "Organization",
          "Subject",
          "Message",
          "Date",
        ],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    }

    // Convert to array and append
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

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Contacts"] = newSheet;

    // Write file safely
    XLSX.writeFile(workbook, filePath);

    // ✅ AMP requires JSON response
    return res.status(200).json({
      success: true,
      message: "Message received and saved",
    });
  } catch (err) {
    console.error("🔥 CONTACT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message",
      error: err.message,
    });
  }
});

/* ==========================
   📌 DOWNLOAD EXCEL FILE
   ========================== */
router.get("/download", (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      return res.download(filePath, "contacts.xlsx");
    } else {
      return res.status(404).json({
        success: false,
        message: "No contacts file found",
      });
    }
  } catch (err) {
    console.error("🔥 DOWNLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
});

module.exports = router;
