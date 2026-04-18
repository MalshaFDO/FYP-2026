import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Vehicle from "@/models/vehicle";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Get user from token
    const user = getUserFromToken(req);

    const {
      vehicleNumber,
      vehicleType,
      brand,
      model,
      fuelType,
      currentOil,
    } = await req.json();

    // 🔍 Check duplicate
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });

    if (existingVehicle) {
      return NextResponse.json(
        { message: "Vehicle already exists" },
        { status: 400 }
      );
    }

    // 💾 Save vehicle
    const newVehicle = await Vehicle.create({
      userId: user.userId,
      vehicleNumber,
      vehicleType,
      brand,
      model,
      fuelType,
      currentOil,
    });

    return NextResponse.json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
    });
  } catch (error: any) {
    console.error("ADD VEHICLE ERROR:", error);

    return NextResponse.json(
      {
        message: "Error adding vehicle",
        error: error.message,
      },
      { status: 500 }
    );
  }
}