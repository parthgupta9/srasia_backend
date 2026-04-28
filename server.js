const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const blogsRoute = require('./routes/blogs');
const jobRoutes = require('./routes/jobRoutes');
const conferenceRoutes = require('./routes/conference');
const reportRoutes = require("./routes/reports");
const eventRoutes = require('./routes/events');
const volunteerRoutes = require('./routes/volunteer');
const newsletterRoutes = require("./routes/newsletter");
const proposalRoutes = require("./routes/ProposalRoutes");
const feedbackRoutes = require("./routes/feedback");
const complaintRoutes = require("./routes/Coplaint");
const adminAuthRoutes = require("./routes/adminAuth");
const adminCrudRoutes = require("./routes/adminCrud");
const AdminUser = require("./models/AdminUser");
const { setServers } = require("node:dns");


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sr-asia.org",
  "https://www.sr-asia.org",
  /\.vercel\.app$/, // allow preview deployments
];

async function ensureDefaultAdmin() {
  const email = "admin@admin.com";
  const password = "12345678";

  let admin = await AdminUser.findOne({ email });

  if (!admin) {
    admin = new AdminUser({
      name: "Admin",
      email,
      password,
      role: "admin",
      isActive: true,
    });

    await admin.save();
    console.log("Default admin user created: admin@admin.com");
  } else {
    // Keep default credentials in sync so login always works for this admin account.
    admin.name = "Admin";
    admin.password = password;
    admin.role = "admin";
    admin.isActive = true;
    await admin.save();
    console.log("Default admin user updated: admin@admin.com");
  }

  const savedAdmin = await AdminUser.findOne({ email }).select("_id email role isActive updatedAt");
  console.log("Default admin verification:", savedAdmin);
}


setServers(["1.1.1.1", "8.8.8.8"]);


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some(o =>
        typeof o === "string" ? o === origin : o.test(origin)
      )
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));


app.use(express.json());

// Routes
app.use("/api", require("./routes/contact"))
app.use('/api/events', eventRoutes);
app.use("/api/blogs", blogsRoute);
app.use("/api", jobRoutes)
app.use("/api/conference", conferenceRoutes);
app.use("/", reportRoutes);
const path = require('path');
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/empanelment", require("./routes/empanelment"));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/newsletter", newsletterRoutes);

app.use("/api/proposals", proposalRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminCrudRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  ensureDefaultAdmin()
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
      });
    })
    .catch((seedErr) => {
      console.error("Failed to ensure default admin user:", seedErr);
      app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
      });
    });
})
.catch(err => console.error('Mongo connection error:', err));
