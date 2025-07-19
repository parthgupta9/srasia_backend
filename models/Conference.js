const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  name: String,
  url: String,
});

const conferenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  intro: String,
  pdfs: [pdfSchema],
  images: [String],
}, { timestamps: true });

const Conference = mongoose.model("Conference", conferenceSchema);
module.exports = Conference;
