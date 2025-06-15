const nodemailer = require("nodemailer")
const jobs = []

exports.getJobs = (req, res) => {
  const { type } = req.query
  if (!type) return res.json(jobs)
  const filtered = jobs.filter(job => job.type === type)
  res.json(filtered)
}


exports.addJob = (req, res) => {
  const { title, description, type } = req.body
  if (!title || !description || !type) {
    return res.status(400).json({ error: "All fields are required" })
  }
  const job = { _id: Date.now().toString(), title, description, type }
  jobs.push(job)
  res.json(job)
}



exports.deleteJob = (req, res) => {
  const { id } = req.params
  const index = jobs.findIndex(j => j._id === id)
  if (index > -1) {
    jobs.splice(index, 1)
    return res.json({ success: true })
  }
  res.status(404).json({ error: "Job not found" })
}

exports.applyToJob = async (req, res) => {
  const { name, email, experience, ctc, jobId } = req.body
  const resume = req.file

  if (!name || !email || !resume || !jobId) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"SR Asia Careers" <${process.env.MAIL_USER}>`,
      to: "hr@sr-asia.org",
      subject: `New Application for Job ID: ${jobId}`,
      text: `Name: ${name}\nEmail: ${email}\nExperience: ${experience}\nCTC: ${ctc}`,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    })

    res.json({ success: true })
  } catch (error) {
    console.error("Email sending failed:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
}

