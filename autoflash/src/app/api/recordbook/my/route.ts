import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getUserFromToken } from "@/lib/auth";
import FeatureSetting from "@/models/featureSetting";
import RecordBook from "@/models/recordBook";
import Vehicle from "@/models/vehicle";

const normalizeVehicleNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const FEATURE_KEY = "e-record-book";

export async function GET(req: Request) {
  try {
    await connectDB();

    const featureSetting = await FeatureSetting.findOne({
      key: FEATURE_KEY,
    }).lean();

    if (!featureSetting?.enabled) {
      return NextResponse.json(
        { message: "E-service record book is not available right now" },
        { status: 403 }
      );
    }

    const authUser = getUserFromToken(req);
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId")?.trim();

    if (!vehicleId || !mongoose.Types.ObjectId.isValid(vehicleId)) {
      return NextResponse.json(
        { message: "A valid vehicle is required" },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: authUser.userId,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    const book =
      (await RecordBook.findOne({ vehicleId: vehicle._id })) ||
      (await RecordBook.findOne({
        vehicleNumber: normalizeVehicleNumber(vehicle.vehicleNumber),
      })) ||
      (await RecordBook.findOne({
        vehicleNumber: vehicle.vehicleNumber,
      }));

    return NextResponse.json({ book });
  } catch (error: any) {
    console.error("RECORDBOOK GET ERROR:", error);

    return NextResponse.json(
      {
        message: "Error fetching record book",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  void req;

  return NextResponse.json(
    { message: "Use the authenticated GET endpoint for record books" },
    { status: 405 }
  );
}
