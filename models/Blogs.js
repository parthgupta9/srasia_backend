const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Blog', BlogSchema);
