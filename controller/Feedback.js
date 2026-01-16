const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    await Feedback.create({ message: req.body.message });
    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
