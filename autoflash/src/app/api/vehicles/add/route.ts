import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import {
  getVehicleNumberRegex,
  normalizeVehicleNumber,
  normalizeVehicleNumberForStorage,
} from "@/lib/vehicleNumber";
import Vehicle from "@/models/vehicle";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = getUserFromToken(req);
    const {
      vehicleNumber,
      vehicleType,
      brand,
      model,
      fuelType,
      currentOil,
    } = await req.json();

    const normalizedVehicleNumber =
      typeof vehicleNumber === "string" ? normalizeVehicleNumber(vehicleNumber) : "";
    const trimmedBrand = typeof brand === "string" ? brand.trim() : "";
    const trimmedModel = typeof model === "string" ? model.trim() : "";

    if (!normalizedVehicleNumber || !vehicleType || !trimmedBrand || !trimmedModel) {
      return NextResponse.json(
        { message: "Vehicle number, type, make, and model are required." },
        { status: 400 }
      );
    }

    const existingVehicle = await Vehicle.findOne({
      vehicleNumber: getVehicleNumberRegex(normalizedVehicleNumber),
    });

    if (existingVehicle) {
      return NextResponse.json(
        { message: "This vehicle number is already registered." },
        { status: 409 }
      );
    }

    const newVehicle = await Vehicle.create({
      userId: user.userId,
      vehicleNumber: normalizeVehicleNumberForStorage(normalizedVehicleNumber),
      vehicleType,
      brand: trimmedBrand,
      model: trimmedModel,
      fuelType: fuelType || "",
      currentOil: currentOil || "",
    });

    return NextResponse.json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
    });
  } catch (error: unknown) {
    console.error("ADD VEHICLE ERROR:", error);

    return NextResponse.json(
      {
        message: "Error adding vehicle",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
