import mongoose, { Schema, models } from "mongoose";

const OTPSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = models.OTP || mongoose.model("OTP", OTPSchema);

export default OTP;