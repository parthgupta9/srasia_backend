const Job = require("../models/Job");
const { readFile, utils, writeFile } = require("xlsx");
const { existsSync } = require("fs");
const { join } = require("path");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

/* ======================
   📧 EMAIL SETUP
   ====================== */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
const hasSendGridKey = Boolean(SENDGRID_API_KEY);
const hasSmtpCreds = Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);

if (hasSendGridKey) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const smtpTransport = hasSmtpCreds
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  : null;

/* ======================
   🧾 EMAIL CONTENT
   ====================== */
const buildApplicationText = (data) => `
Name: ${data.name || "N/A"}
Email: ${data.email || "N/A"}
Phone: ${data.phone || "N/A"}
Previous Organization: ${data.previousOrganization || "N/A"}
Institution Name: ${data.institutionName || "N/A"}
Highest Qualification: ${data.highestQualification || "N/A"}
Experience: ${data.experience || "N/A"}
Expected CTC: ${data.expectedCtc || "N/A"}
`;

/* ======================
   📤 SEND EMAIL (SG → SMTP)
   ====================== */
const sendApplicationEmail = async ({ resume, ...fields }) => {
  const subject = `New Application for "${fields.jobTitle}"`;
  const text = buildApplicationText(fields);

  // ---- Try SendGrid first ----
  if (hasSendGridKey) {
    try {
      await sgMail.send({
        to: "career.srasia@gmail.com",
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject,
        text,
        attachments: [
          {
            content: resume.buffer.toString("base64"),
            filename: resume.originalname,
            type: resume.mimetype,
            disposition: "attachment",
          },
        ],
      });
      console.log("✅ Email sent via SendGrid");
      return "sendgrid";
    } catch (err) {
      const unauthorized = err.code === 401 || err.response?.statusCode === 401;
      console.error(
        "❌ SendGrid send failed:",
        err.response?.body || err.message
      );
      if (!unauthorized) throw err;
      console.warn("⚠️ SendGrid unauthorized, falling back to SMTP");
    }
  }

  // ---- SMTP fallback ----
  if (smtpTransport) {
    await smtpTransport.sendMail({
      to: "career.srasia@gmail.com",
      from: process.env.SENDGRID_SENDER_EMAIL || process.env.MAIL_USER,
      subject,
      text,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
          contentType: resume.mimetype,
        },
      ],
    });
    console.log("✅ Email sent via SMTP");
    return "smtp";
  }

  throw new Error("No email transport configured");
};

/* ======================
   📄 GET JOBS
   ====================== */
exports.getJobs = async (req, res) => {
  try {
    const { type } = req.query;

    const jobs = type
      ? await Job.find({ type }).sort({ createdAt: -1 })
      : await Job.find().sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ getJobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

/* ======================
   ➕ ADD JOB
   ====================== */
exports.addJob = async (req, res) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await Job.create({ title, description, type });
    res.status(201).json(job);
  } catch (err) {
    console.error("❌ addJob error:", err);
    res.status(500).json({ error: "Failed to add job" });
  }
};

/* ======================
   ❌ DELETE JOB
   ====================== */
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ deleteJob error:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

/* ======================
   📝 APPLY TO JOB
   ====================== */
exports.applyToJob = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      previousOrganization,
      institutionName,
      highestQualification,
      experience,
      expectedCtc,
      jobTitle,
    } = req.body;

    const resume = req.file;

    if (!name || !email || !jobTitle || !resume) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ---- Send Email ----
    const transport = await sendApplicationEmail({
      resume,
      name,
      email,
      phone,
      previousOrganization,
      institutionName,
      highestQualification,
      experience,
      expectedCtc,
      jobTitle,
    });

    // ---- Save to Excel (NON-CRITICAL) ----
    try {
      const filePath = join(__dirname, "../job_applications.xlsx");
      let workbook;
      let worksheet;

      if (existsSync(filePath)) {
        workbook = readFile(filePath);
        worksheet = workbook.Sheets["Applications"];
      } else {
        workbook = utils.book_new();
        worksheet = utils.aoa_to_sheet([
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
        utils.book_append_sheet(workbook, worksheet, "Applications");
      }

      const data = utils.sheet_to_json(worksheet, { header: 1 });

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

      workbook.Sheets["Applications"] = utils.aoa_to_sheet(data);
      writeFile(workbook, filePath);
    } catch (fileErr) {
      console.warn("⚠️ Excel save failed:", fileErr.message);
    }

    res.status(200).json({ success: true, transport });
  } catch (err) {
    console.error("❌ applyToJob error:", err);
    res.status(500).json({ error: "Failed to send or save application" });
  }
};

/* ======================
   ⬇️ DOWNLOAD APPLICATIONS
   ====================== */
exports.downloadApplications = (req, res) => {
  try {
    const filePath = join(__dirname, "../job_applications.xlsx");
    if (!existsSync(filePath)) {
      return res.status(404).send("No applications file found.");
    }
    res.download(filePath, "job_applications.xlsx");
  } catch (err) {
    console.error("❌ downloadApplications error:", err);
    res.status(500).send("Error downloading file");
  }
};

console.log("✅ Job model loaded:", typeof Job);
