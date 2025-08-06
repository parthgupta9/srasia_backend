const express = require("express");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📌 Empanelment submission
router.post("/send", async (req, res) => {
  const { name, email, phone, category } = req.body;

  if (!name || !phone || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ====== Email Setup ======
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // App Password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: "career.srasia@gmail.com",
    subject: "New Empanelment Submission",
    html: `
      <h3>New Empanelment Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email || "Not Provided"}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Category:</strong> ${category}</p>
    `,
  };

  try {
    // Send Email
    await transporter.sendMail(mailOptions);

    // Save to Excel
    const filePath = path.join(__dirname, "../empanelments.xlsx");
    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Empanelments"];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "Email", "Phone", "Category", "Date"],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Empanelments");
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([
      name,
      email || "Not Provided",
      phone,
      category,
      new Date().toLocaleString(),
    ]);

    worksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Empanelments"] = worksheet;
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ message: "Empanelment saved & email sent!" });
  } catch (error) {
    console.error("Empanelment send/save error:", error);
    res.status(500).json({ error: "Failed to send/save empanelment" });
  }
});

// 📌 Download Empanelments Excel
router.get("/empanelments/download", (req, res) => {
  const filePath = path.join(__dirname, "../empanelments.xlsx");

  if (fs.existsSync(filePath)) {
    res.download(filePath, "empanelments.xlsx");
  } else {
    res.status(404).json({ error: "No empanelments file found" });
  }
});

module.exports = router;
