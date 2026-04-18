import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OTP from "@/models/otp";
import User from "@/models/user";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone, otp } = await req.json();

    // 🔍 Find latest OTP
    const otpRecord = await OTP.findOne({ phone }).sort({
      createdAt: -1,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP not found" },
        { status: 404 }
      );
    }

    // ⏳ Check expiry
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    // ❌ Check match
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 👤 Check if user exists
    let user = await User.findOne({ phone });

    // 🆕 If not → create user
    if (!user) {
      user = await User.create({
        name: "New User",
        phone,
        email: `${phone}@autoflash.com`,
        password: "otp-user",
      });
    }

    // 🎟 Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      {
        message: "Error verifying OTP",
        error: error.message,
      },
      { status: 500 }
    );
  }
}