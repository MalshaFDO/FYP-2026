import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/user";
import Vehicle from "@/models/vehicle";
import { getPhoneCandidates, normalizePhoneNumber } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      name,
      email,
      phone,
      password,
      vehicleNumber,
      vehicleType,
      brand,
      model,
      fuelType,
      currentOil,
    } = await req.json();

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone =
      typeof phone === "string" ? normalizePhoneNumber(phone) : "";
    const normalizedVehicleNumber =
      typeof vehicleNumber === "string" ? vehicleNumber.trim().toUpperCase() : "";

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: { $in: getPhoneCandidates(normalizedPhone) } },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "This customer already exists. Please log in instead." },
        { status: 400 }
      );
    }

    const existingVehicle = await Vehicle.findOne({ vehicleNumber: normalizedVehicleNumber });

    if (existingVehicle) {
      return NextResponse.json(
        { message: "This vehicle number is already registered." },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    const newVehicle = await Vehicle.create({
      userId: newUser._id,
      vehicleNumber: normalizedVehicleNumber,
      vehicleType,
      brand,
      model,
      fuelType: fuelType || "",
      currentOil: currentOil || "",
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
        vehicle: newVehicle,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        message: "Signup error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
