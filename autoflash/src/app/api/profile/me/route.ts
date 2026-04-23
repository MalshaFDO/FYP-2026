import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getUserFromToken } from "@/lib/auth";
import User from "@/models/user";
import Vehicle from "@/models/vehicle";
import OTP from "@/models/otp";

export async function GET(req: Request) {
  try {
    await connectDB();

    const authUser = getUserFromToken(req);

    const [user, vehicles] = await Promise.all([
      User.findById(authUser.userId).select("name email phone profileImage"),
      Vehicle.find({ userId: authUser.userId }).sort({ createdAt: -1 }),
    ]);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
      vehicles,
    });
  } catch (error: any) {
    console.error("PROFILE ME ERROR:", error);

    return NextResponse.json(
      {
        message: "Error fetching profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const authUser = getUserFromToken(req);
    const {
      name,
      email,
      profileImage,
      newPhone,
      currentPhoneOtp,
    } = await req.json();

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedProfileImage =
      typeof profileImage === "string" ? profileImage.trim() : "";
    const trimmedNewPhone =
      typeof newPhone === "string" ? newPhone.trim() : "";
    const trimmedCurrentPhoneOtp =
      typeof currentPhoneOtp === "string" ? currentPhoneOtp.trim() : "";

    if (!trimmedName) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    if (!trimmedEmail) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const emailOwner = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: authUser.userId },
    }).select("_id");

    if (emailOwner) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 409 }
      );
    }

    const currentUser = await User.findById(authUser.userId).select("phone");

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    let nextPhone = currentUser.phone;

    if (trimmedNewPhone && trimmedNewPhone !== currentUser.phone) {
      if (!trimmedCurrentPhoneOtp) {
        return NextResponse.json(
          { message: "OTP from the current mobile number is required" },
          { status: 400 }
        );
      }

      const phoneOwner = await User.findOne({
        phone: trimmedNewPhone,
        _id: { $ne: authUser.userId },
      }).select("_id");

      if (phoneOwner) {
        return NextResponse.json(
          { message: "Mobile number is already in use" },
          { status: 409 }
        );
      }

      const otpRecord = await OTP.findOne({ phone: currentUser.phone }).sort({
        createdAt: -1,
      });

      if (!otpRecord) {
        return NextResponse.json(
          { message: "OTP not found for the current mobile number" },
          { status: 404 }
        );
      }

      if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json(
          { message: "OTP expired" },
          { status: 400 }
        );
      }

      if (otpRecord.otp !== trimmedCurrentPhoneOtp) {
        return NextResponse.json(
          { message: "Invalid OTP" },
          { status: 400 }
        );
      }

      nextPhone = trimmedNewPhone;
    }

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        name: trimmedName,
        email: trimmedEmail,
        profileImage: trimmedProfileImage,
        phone: nextPhone,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email phone profileImage");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Profile updated", user });
  } catch (error: any) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message: "Error updating profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
