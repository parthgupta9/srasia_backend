const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// ===== GET JOBS =====
exports.getJobs = async (req, res) => {
  try {
    const { type } = req.query;
    const jobs = type ? await Job.find({ type }) : await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// ===== ADD JOB =====
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

// ===== DELETE JOB =====
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

// ===== APPLY TO JOB =====
exports.applyToJob = async (req, res) => {
  const {
    name,
    email,
    phone,
    previousOrganization,
    institutionName,
    highestQualification,
    experience,
    expectedCtc,
    jobTitle, // Directly passed from frontend
  } = req.body;

  const resume = req.file;

  if (!name || !email || !resume || !jobTitle) {
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
    // ===== Send Email =====
    await transporter.sendMail({
      from: `"SR Asia Careers" <${process.env.MAIL_USER}>`,
      to: "career.srasia@gmail.com",
      subject: `New Application for "${jobTitle}"`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Previous Organization: ${previousOrganization}
        Institution Name: ${institutionName}
        Highest Qualification: ${highestQualification}
        Experience: ${experience}
        Expected CTC: ${expectedCtc}
      `,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    });

    // ===== Save to Excel =====
    const filePath = path.join(__dirname, "../job_applications.xlsx");
    let workbook, worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets["Applications"];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        [
          "Name",
          "Email",
          "Phone",
          "Previous Organization",
          "Institution Name",
          "Highest Qualification",
          "Experience",
          "Expected CTC",
          "Job Title",
          "Date",
        ],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([
      name,
      email,
      phone,
      previousOrganization,
      institutionName,
      highestQualification,
      experience,
      expectedCtc,
      jobTitle,
      new Date().toLocaleString(),
    ]);

    worksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets["Applications"] = worksheet;
    XLSX.writeFile(workbook, filePath);

    res.json({ success: true });
  } catch (error) {
    console.error("Application save/send failed:", error);
    res.status(500).json({ error: "Failed to send or save application" });
  }
};

// ===== DOWNLOAD EXCEL FILE =====
exports.downloadApplications = (req, res) => {
  const filePath = path.join(__dirname, "../job_applications.xlsx");

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("No applications file found.");
  }

  res.download(filePath, "job_applications.xlsx", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }
  });
};
