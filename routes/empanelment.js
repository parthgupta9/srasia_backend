const express = require("express");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📌 Empanelment submission
router.post("/send", async (req, res) => {
  const {
    surname,
    firstname,
    phone,
    email,
    gender,
    dob,
    qualification,
    specialization,
    certification,
    workmode,
    designation,
    employer,
    experience,
    noExpAreas,
    workLocation,
    residence,
    ctc,
    category,
  } = req.body;

  if (!firstname || !phone || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const fullName = `${surname || ""} ${firstname}`.trim();

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
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email || "Not Provided"}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Gender:</strong> ${gender || "Not Provided"}</p>
      <p><strong>Date of Birth:</strong> ${dob || "Not Provided"}</p>
      <p><strong>Highest Qualification:</strong> ${qualification || "Not Provided"}</p>
      <p><strong>Specialization:</strong> ${specialization || "Not Provided"}</p>
      <p><strong>Certifications:</strong> ${certification || "Not Provided"}</p>
      <p><strong>Work Mode:</strong> ${workmode || "Not Provided"}</p>
      <p><strong>Designation:</strong> ${designation || "Not Provided"}</p>
      <p><strong>Employer:</strong> ${employer || "Not Provided"}</p>
      <p><strong>Experience (Years):</strong> ${experience || "0"}</p>
      <p><strong>Areas with No Experience:</strong> ${noExpAreas || "None"}</p>
      <p><strong>Work Location:</strong> ${workLocation || "Not Provided"}</p>
      <p><strong>Residence:</strong> ${residence || "Not Provided"}</p>
      <p><strong>Current CTC:</strong> ${ctc || "Not Provided"}</p>
      <p><strong>Category Applied:</strong> ${category}</p>
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
        [
          "Surname",
          "First Name",
          "Phone",
          "Email",
          "Gender",
          "DOB",
          "Qualification",
          "Specialization",
          "Certification",
          "Work Mode",
          "Designation",
          "Employer",
          "Experience (Years)",
          "No Experience Areas",
          "Work Location",
          "Residence",
          "CTC",
          "Category",
          "Submission Date",
        ],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Empanelments");
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.push([
      surname || "",
      firstname,
      phone,
      email || "",
      gender || "",
      dob || "",
      qualification || "",
      specialization || "",
      certification || "",
      workmode || "",
      designation || "",
      employer || "",
      experience || "",
      noExpAreas || "",
      workLocation || "",
      residence || "",
      ctc || "",
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
