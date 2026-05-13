import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { getPhoneCandidates, normalizePhoneNumber } from "@/lib/phone";
import OTP from "@/models/otp";
import User from "@/models/user";
import Vehicle from "@/models/vehicle";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authUser = getUserFromToken(req);
    const { vehicleId, otp } = await req.json();

    if (!vehicleId || typeof otp !== "string" || !otp.trim()) {
      return NextResponse.json(
        { message: "Vehicle and OTP are required." },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId).select("phone");

    if (!user?.phone) {
      return NextResponse.json(
        { message: "Registered mobile number was not found." },
        { status: 404 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(user.phone);
    const otpRecord = await OTP.findOne({
      phone: { $in: getPhoneCandidates(normalizedPhone) },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json({ message: "OTP not found." }, { status: 404 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: "OTP expired." }, { status: 400 });
    }

    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    const deletedVehicle = await Vehicle.findOneAndDelete({
      _id: vehicleId,
      userId: authUser.userId,
    });

    if (!deletedVehicle) {
      return NextResponse.json(
        { message: "Vehicle not found for this account." },
        { status: 404 }
      );
    }

    await OTP.deleteMany({ phone: { $in: getPhoneCandidates(normalizedPhone) } });

    return NextResponse.json({
      message: "Vehicle deleted successfully.",
      vehicleId,
    });
  } catch (error: unknown) {
    console.error("DELETE VEHICLE ERROR:", error);

    return NextResponse.json(
      {
        message: "Error deleting vehicle",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
