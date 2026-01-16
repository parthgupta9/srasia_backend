const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const ComplaintSchema = new Schema(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = models.Complaint || model('Complaint', ComplaintSchema);
