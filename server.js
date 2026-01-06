const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const PORT = process.env.PORT || 5050;

const blogsRoute = require("./routes/blogs");
const jobRoutes = require("./routes/jobRoutes");
const conferenceRoutes = require("./routes/conference");
const reportRoutes = require("./routes/reports");
const eventRoutes = require("./routes/events");
const volunteerRoutes = require("./routes/volunteer");
const newsletterRoutes = require("./routes/newsletter");
const inquiryRoutes = require("./routes/inquiryRoutes");

const app = express();
app.use((req, res, next) => {
  console.log("🔥 RAW REQUEST ORIGIN:", req.headers.origin);
  next();
});

/* ======================
   🔍 REQUEST LOGGER
   ====================== */
app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

/* ======================
   🌐 CORS (LOCKED & SAFE)
   ====================== */
const allowedOrigins = ["http://localhost:3000", "https://sr-asia.org"];

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ======================
   🧠 BODY PARSERS
   ====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   🚏 ROUTES
   ====================== */
app.use("/api", require("./routes/contact"));
app.use("/api/events", eventRoutes);
app.use("/api/blogs", blogsRoute);
app.use("/api", jobRoutes);
app.use("/api/conference", conferenceRoutes);
app.use("/", reportRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/empanelment", require("./routes/empanelment"));
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/inquiries", inquiryRoutes);

/* ======================
   📁 STATIC FILES
   ====================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   ❌ CORS ERROR HANDLER
   ====================== */
app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({ error: "CORS blocked" });
  }
  next(err);
});

/* ======================
   🗄️ DATABASE + SERVER
   ====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Mongo connection error:", err));

app.use((err, req, res, next) => {
  console.error("🔥 UNHANDLED ERROR:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
    stack: err.stack,
  });
});
