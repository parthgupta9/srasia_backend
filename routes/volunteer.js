const express = require("express");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // your SendGrid API key

// 📌 Submit Volunteer
router.post("/send", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Missing name or phone" });
  }

  const msg = {
    from: process.env.SENDGRID_SENDER_EMAIL, // verified sender
    to: "career.srasia@gmail.com",
    replyTo: "support@sr-asia.com",          // optional
    subject: "New Volunteer Contact",
    html: `
      <h3>New Volunteer Contact</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    `,
  };

  try {
    // Send Email via SendGrid
    await sgMail.send(msg);

    // Save to Excel
    const filePath = path.join(__dirname, "../volunteers.xlsx");
    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Volunteers"];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([["Name", "Phone", "Date"]]);
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
    res.status(500).json({ error: "Failed to send/save volunteer details", details: error.message });
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
