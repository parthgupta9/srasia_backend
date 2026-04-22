const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "change-this-admin-secret";

exports.signInAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await AdminUser.findOne({ email: String(email).toLowerCase().trim() });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      message: "Sign-in successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sign in", error: error.message });
  }
};
