const express = require("express");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📌 Submit Volunteer
router.post("/volunteers/send", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Missing name or phone" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // App Password from Google
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: "career.srasia@gmail.com",
    subject: "New Volunteer Contact",
    html: `
      <h3>New Volunteer Contact</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    `,
  };

  try {
    // Send Email
    await transporter.sendMail(mailOptions);

    // Save to Excel
    const filePath = path.join(__dirname, "../volunteers.xlsx");
    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Volunteers"];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "Phone", "Date"],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteers");
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([name, phone, new Date().toLocaleString()]);

    worksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Volunteers"] = worksheet;
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ message: "Volunteer saved & email sent!" });
  } catch (error) {
    console.error("Volunteer send/save error:", error);
    res.status(500).json({ error: "Failed to send/save volunteer details" });
  }
});

// 📌 Download Volunteers Excel
router.get("/volunteers/download", (req, res) => {
  const filePath = path.join(__dirname, "../volunteers.xlsx");

  if (fs.existsSync(filePath)) {
    res.download(filePath, "volunteers.xlsx");
  } else {
    res.status(404).json({ error: "No volunteers file found" });
  }
});

module.exports = router;
