const Proposal = require("../models/Proposal");

exports.createProposal = async (req, res) => {
  try {
    await Proposal.create(req.body);
    res.status(201).json({ success: true, message: "Proposal submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
