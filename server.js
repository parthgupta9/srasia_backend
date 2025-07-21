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

const app = express();

const allowedOrigins = [
  "http://localhost:3000",        // For local development
  "https://sr-asia.org",          // ✅ Your Vercel production domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
})
.catch(err => console.error('Mongo connection error:', err));
