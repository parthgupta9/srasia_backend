const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProposalSchema = new Schema(
  {
    title: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    jobTitle: String,
    email: { type: String, required: true },
    phone: String,
    location: String,
    industry: String,
    companyName: String,
    service: String,
    yearlyRevenue: Number,
    comment: String,
  },
  { timestamps: true }
);

module.exports = model('Proposal', ProposalSchema);
