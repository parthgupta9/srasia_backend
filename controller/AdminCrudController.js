const Blog = require("../models/Blogs");
const Complaint = require("../models/Complaint");
const Conference = require("../models/Conference");
const Contact = require("../models/Contact");
const Event = require("../models/Events");
const Feedback = require("../models/Feedback");
const JobApplication = require("../models/Job");
const Proposal = require("../models/Proposal");
const Report = require("../models/Reports");
const Subscriber = require("../models/subscribe");
const AdminUser = require("../models/AdminUser");

const MODEL_MAP = {
  blog: Blog,
  blogs: Blog,
  complaint: Complaint,
  complaints: Complaint,
  conference: Conference,
  conferences: Conference,
  contact: Contact,
  contacts: Contact,
  event: Event,
  events: Event,
  feedback: Feedback,
  feedbacks: Feedback,
  job: JobApplication,
  jobs: JobApplication,
  jobapplication: JobApplication,
  jobapplications: JobApplication,
  proposal: Proposal,
  proposals: Proposal,
  report: Report,
  reports: Report,
  subscriber: Subscriber,
  subscribers: Subscriber,
  newsletter: Subscriber,
  newsletters: Subscriber,
  adminuser: AdminUser,
  adminusers: AdminUser,
  "admin-users": AdminUser,
};

function normalizeResource(resource) {
  return String(resource || "").toLowerCase().replace(/_/g, "").trim();
}

function getModelByResource(resource) {
  const normalized = normalizeResource(resource);
  return MODEL_MAP[normalized] || null;
}

function sanitizeForResponse(resource, doc) {
  if (!doc) return doc;

  const normalized = normalizeResource(resource);

  if (["adminuser", "adminusers", "admin-users"].includes(normalized)) {
    const object = doc.toObject ? doc.toObject() : doc;
    delete object.password;
    return object;
  }

  return doc;
}

exports.listRecords = async (req, res) => {
  try {
    const Model = getModelByResource(req.params.resource);
    if (!Model) return res.status(404).json({ message: "Unknown resource" });

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;

    const hasCreatedAt = Boolean(Model.schema && Model.schema.path("createdAt"));
    const sort = hasCreatedAt ? { createdAt: -1 } : { _id: -1 };

    const [data, total] = await Promise.all([
      Model.find(filters).sort(sort).skip(skip).limit(limit),
      Model.countDocuments(filters),
    ]);

    return res.status(200).json({
      data: data.map((item) => sanitizeForResponse(req.params.resource, item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch records", error: error.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const Model = getModelByResource(req.params.resource);
    if (!Model) return res.status(404).json({ message: "Unknown resource" });

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Record not found" });

    return res.status(200).json(sanitizeForResponse(req.params.resource, item));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch record", error: error.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const Model = getModelByResource(req.params.resource);
    if (!Model) return res.status(404).json({ message: "Unknown resource" });

    const payload = { ...req.body };

    if (Model === AdminUser && payload.email) {
      payload.email = String(payload.email).toLowerCase().trim();
    }

    const created = await Model.create(payload);

    return res.status(201).json(sanitizeForResponse(req.params.resource, created));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create record", error: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const Model = getModelByResource(req.params.resource);
    if (!Model) return res.status(404).json({ message: "Unknown resource" });

    const payload = { ...req.body };

    if (Model === AdminUser && payload.email) {
      payload.email = String(payload.email).toLowerCase().trim();
    }

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Record not found" });

    Object.keys(payload).forEach((key) => {
      item[key] = payload[key];
    });

    await item.save();

    return res.status(200).json(sanitizeForResponse(req.params.resource, item));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update record", error: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const Model = getModelByResource(req.params.resource);
    if (!Model) return res.status(404).json({ message: "Unknown resource" });

    const deleted = await Model.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });

    return res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete record", error: error.message });
  }
};
