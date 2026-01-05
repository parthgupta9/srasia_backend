const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    organization: String,
    subject: String,
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
