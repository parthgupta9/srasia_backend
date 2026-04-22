const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin", trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminUserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!candidatePassword) return false;

  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Legacy support for old plain-text records.
  return candidatePassword === this.password;
};

module.exports = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
