
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const JobApplication = require("../models/Job");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

const sgMail = require("@sendgrid/mail");

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    jobTitle,
  } = req.body;

  const resume = req.file;

  if (!name || !email || !resume || !jobTitle) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("🔄 Processing job application:", { name, email, jobTitle });
    console.log("📄 Resume info:", { 
      filename: resume.originalname, 
      size: resume.size,
      mimetype: resume.mimetype 
    });

    // ===== 1️⃣ UPLOAD RESUME TO CLOUDINARY =====
    let resumeData = {};
    try {
      console.log("⏳ Starting Cloudinary upload...");
      const cloudinaryResult = await uploadToCloudinary(
        resume.buffer,
        resume.originalname,
        "resumes"
      );
      
      resumeData = {
        filename: resume.originalname,
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        size: resume.size,
      };
      
      console.log("✅ Resume uploaded successfully:", resumeData.url);
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary upload failed:", cloudinaryError);
      return res.status(500).json({ 
        error: "Failed to upload resume. Please try again.",
        details: cloudinaryError.message 
      });
    }

    // ===== 2️⃣ SAVE TO MONGODB =====
    console.log("💾 Saving to MongoDB...");
    const jobApp = await JobApplication.create({
      name,
      email,
      phone,
      previousOrganization,
      institutionName,
      highestQualification,
      experience,
      expectedCtc,
      jobTitle,
      resume: resumeData,
    });
    console.log("✅ Saved to MongoDB with ID:", jobApp._id);

    // ===== 3️⃣ SEND EMAIL =====
    const msg = {
      to: "career.srasia@gmail.com",
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject: `New Application for "${jobTitle}"`,
      html: `
        <h3>New Job Application</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Previous Organization:</strong> ${previousOrganization}</p>
        <p><strong>Institution Name:</strong> ${institutionName}</p>
        <p><strong>Highest Qualification:</strong> ${highestQualification}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Expected CTC:</strong> ${expectedCtc}</p>
        <p><strong>Resume:</strong> <a href="${resumeData.url}">Download Resume</a></p>
      `,
    };

    try {
      console.log("📧 Sending email...");
      await sgMail.send(msg);
      console.log("✅ Email sent successfully");
    } catch (e) {
      console.error("⚠️ SendGrid failed:", e.message);
    }

    // ===== 4️⃣ SAVE TO EXCEL =====
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
          "Resume URL",
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
      resumeData.url,
      new Date().toLocaleString(),
    ]);

    workbook.Sheets["Applications"] = XLSX.utils.aoa_to_sheet(data);
    try {
      XLSX.writeFile(workbook, filePath);
      console.log("✅ Excel file updated");
    } catch (e) {
      console.error("⚠️ Excel write failed:", e.message);
    }

    console.log("🎉 Application processed successfully");
    res.json({ 
      success: true, 
      message: "Application submitted successfully",
      applicationId: jobApp._id,
      resumeUrl: resumeData.url
    });
  } catch (error) {
    console.error("❌ Application processing failed:", error);
    res.status(500).json({ 
      error: "Failed to process application",
      details: error.message 
    });
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
