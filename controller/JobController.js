const nodemailer = require("nodemailer");
const Job = require("../models/Job");

exports.getJobs = async (req, res) => {
  try {
    const { type } = req.query;
    const jobs = type ? await Job.find({ type }) : await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

exports.addJob = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await Job.create({ title, description, type });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to add job" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};

exports.applyToJob = async (req, res) => {
  const { name, email, experience, ctc, jobId } = req.body;
  const resume = req.file;

  if (!name || !email || !resume || !jobId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    await transporter.sendMail({
      from: `"SR Asia Careers" <${process.env.MAIL_USER}>`,
      to: "career.sr@gmail.com ",
      subject: `New Application for "${job.title}"`,
      text: `Name: ${name}\nEmail: ${email}\nExperience: ${experience}\nCTC: ${ctc}`,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ error: "Failed to send application" });
  }
};
