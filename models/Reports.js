const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["brsr", "impact", "social"],
    required: true,
  },
  image: String,
  alt: String,
  title: String,
  subtitle: String,
  link: String,
  description: String,
});

module.exports = mongoose.model("Report", reportSchema);
