const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/send", async (req, res) => {
  const { name, email, phone, category } = req.body;

  if (!name || !phone || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // App Password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: "parth615gupta@gmail.com",
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
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Empanelment email sent successfully!" });
  } catch (error) {
    console.error("Empanelment email send error:", error);
    res.status(500).json({ error: "Failed to send empanelment email" });
  }
});

module.exports = router;
