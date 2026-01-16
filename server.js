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


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sr-asia.org",
  "https://www.sr-asia.org",
  /\.vercel\.app$/, // allow preview deployments
];

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
  methods: ["GET", "POST"],
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
