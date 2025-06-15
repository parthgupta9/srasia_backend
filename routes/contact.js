// routes/contact.js
const express = require("express")
const router = express.Router()

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body

    // Save to database or send email
    console.log("Contact form submitted:", req.body)

    res.status(200).json({ message: "Message received successfully!" })
  } catch (err) {
    res.status(500).json({ error: "Failed to submit message." })
  }
})

module.exports = router
