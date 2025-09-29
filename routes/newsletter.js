const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscribe");
const nodemailer = require("nodemailer");

// Subscribe a user
router.post("/subscribe", async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Already subscribed" });
    }

    const subscriber = await Subscriber.create({ name, phone, email });
    res.json({ message: "Subscribed successfully!", subscriber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error subscribing" });
  }
});

// Send newsletter to all subscribers
router.post("/send", async (req, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ message: "Subject and content are required" });
  }

  try {
    const subscribers = await Subscriber.find({});
    if (!subscribers.length) {
      return res.status(404).json({ message: "No subscribers found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Gmail app password
      },
    });

    const recipientEmails = subscribers.map((s) => s.email);

    await transporter.sendMail({
      from: `"SR Asia Newsletter" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // sender in To
      bcc: recipientEmails,       // all subscribers hidden in BCC
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <p>${content}</p>
          <br/>
          <p>– Team SR Asia</p>
          <p style="font-size:12px;color:#666">
            You are receiving this because you subscribed to SR Asia Newsletter.
            <br/>
            To unsubscribe, contact us at support@sr-asia.com
          </p>
        </div>
      `,
    });

    res.json({ message: `Newsletter sent to ${subscribers.length} subscribers` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending newsletter", error: err.message });
  }
});

module.exports = router;
