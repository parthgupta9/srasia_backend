const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const blogsRoute = require("./routes/blogs");
const jobRoutes = require("./routes/jobRoutes");
const conferenceRoutes = require("./routes/conference");
const reportRoutes = require("./routes/reports");
const eventRoutes = require("./routes/events");
const volunteerRoutes = require("./routes/volunteer");
const newsletterRoutes = require("./routes/newsletter");
const inquiryRoutes = require("./routes/inquiryRoutes");
const contactRoutes = require("./routes/contact");
const empanelmentRoutes = require("./routes/empanelment");

const app = express();
const PORT = process.env.PORT || 5050;

/* ======================
   🔐 ALLOWED ORIGINS
   ====================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://sr-asia.org",
  "https://mail.google.com",
  "https://mail.yahoo.com",
  "https://my.stripo.email",
];

/* ======================
   🌐 AMP + WEBSITE CORS
   ====================== */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ampSourceOrigin = req.query.__amp_source_origin;

  console.log("🔥 ORIGIN:", origin || "NO ORIGIN (AMP/Server)");
  console.log("🔥 AMP SOURCE ORIGIN:", ampSourceOrigin);

  // Allow website + AMP clients
  // For AMP emails, we need to be more permissive
  if (!origin || origin === "null" || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    console.warn("⚠️ CORS: Allowing request from:", origin);
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Required for AMP Email Forms
  if (ampSourceOrigin) {
    res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      decodeURIComponent(ampSourceOrigin),
    );
  } else {
    res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      "https://mail.google.com",
    );
  }

  // Preflight handler
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================
   🧠 BODY PARSERS
   ====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   🔍 REQUEST LOGGER
   ====================== */
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

/* ======================
   🚏 ROUTES
   ====================== */
app.use("/api/contact", contactRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/blogs", blogsRoute);
app.use("/api/jobs", jobRoutes);
app.use("/api/conference", conferenceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/empanelment", empanelmentRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/contact", require("./routes/contact"));

/* ======================
   📁 STATIC FILES
   ====================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   ❌ 404 HANDLER
   ====================== */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ======================
   ⚠️ ERROR HANDLER
   ====================== */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

/* ======================
   🗄️ DATABASE + SERVER
   ====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
