const Conference = require('../models/Conference');

// POST /admin/conference
exports.addConference = async (req, res) => {
  try {
    const conference = new Conference(req.body);
    await conference.save();
    res.status(201).json({ success: true, message: "Conference added", data: conference });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding conference", error: err.message });
  }
};

// GET /api/conferences
exports.getAllConferences = async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: conferences });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch conferences", error: err.message });
  }
};
