import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OTP from "@/models/otp";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { message: "Phone is required" },
        { status: 400 }
      );
    }

    // 🔢 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏳ Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 💾 Save OTP
    await OTP.create({
      phone,
      otp,
      expiresAt,
    });

    console.log("OTP for", phone, ":", otp); // TEMP (for testing)

    return NextResponse.json({
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      {
        message: "Error sending OTP",
        error: error.message,
      },
      { status: 500 }
    );
  }
}