const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["buyer", "admin", "farmer", "industry"], default: "buyer" },
  phone: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: "India" }
  },
  businessName: { type: String },
  businessType: { type: String },
  businessDescription: { type: String },
  businessLogo: { type: String },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  // OTP Authentication fields
  otp: { type: String },
  otpExpiry: { type: Date },
  otpVerified: { type: Boolean, default: false },
  otpAttempts: { type: Number, default: 0 },
  otpLastSent: { type: Date },
  sessionToken: { type: String },
  sessionExpiry: { type: Date }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
