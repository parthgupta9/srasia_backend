const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const blogsRoute = require('./routes/blogs');
const jobRoutes = require('./routes/jobRoutes');
const conferenceRoutes = require('./routes/conference');
const reportRoutes = require("./routes/reports");
const eventRoutes = require('./routes/events');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/contact"))
app.use('/api/events', eventRoutes);
app.use("/api/blogs", blogsRoute);
app.use("/api", jobRoutes)
app.use("/api/conference", conferenceRoutes);
app.use("/", reportRoutes);
const path = require('path');

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
