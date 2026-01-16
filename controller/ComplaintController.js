const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;
    await Complaint.create({ subject, message });
    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
