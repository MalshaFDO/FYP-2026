import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import OTP from "@/models/otp";
import User from "@/models/user";
import { getPhoneCandidates, normalizePhoneNumber } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone, otp } = await req.json();
    const normalizedPhone =
      typeof phone === "string" ? normalizePhoneNumber(phone) : "";

    if (!normalizedPhone || typeof otp !== "string") {
      return NextResponse.json(
        { message: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await OTP.findOne({ phone: normalizedPhone }).sort({
      createdAt: -1,
    });

    if (!otpRecord) {
      return NextResponse.json({ message: "OTP not found" }, { status: 404 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const user = await User.findOne({
      phone: { $in: getPhoneCandidates(normalizedPhone) },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "This mobile number is not registered. Please sign up first.",
          isNewUser: true,
        },
        { status: 404 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    await OTP.deleteMany({ phone: normalizedPhone });

    return NextResponse.json({
      message: "Login successful",
      token,
      user,
      isNewUser: false,
    });
  } catch (error: unknown) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      {
        message: "Error verifying OTP",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
