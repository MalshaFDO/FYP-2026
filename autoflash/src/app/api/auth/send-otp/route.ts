import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OTP from "@/models/otp";
import { normalizePhoneNumber } from "@/lib/phone";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone } = await req.json();
    const normalizedPhone =
      typeof phone === "string" ? normalizePhoneNumber(phone) : "";

    if (!normalizedPhone) {
      return NextResponse.json(
        { message: "Phone is required" },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ phone: normalizedPhone });
    await OTP.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    try {
      await sendOtpSms(normalizedPhone, otp);
    } catch (error) {
      await OTP.deleteMany({ phone: normalizedPhone });
      throw error;
    }

    return NextResponse.json({
      message: "OTP sent successfully",
    });
  } catch (error: unknown) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      {
        message: "Error sending OTP",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
