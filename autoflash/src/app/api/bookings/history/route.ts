import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getUserFromToken } from "@/lib/auth";
import Booking from "@/models/booking";
import Vehicle from "@/models/vehicle";

export async function GET(req: Request) {
  try {
    await connectDB();

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

    const bookings = await Booking.find({
      $or: [
        { vehicleId: vehicle._id },
        { vehicleNumber: vehicle.vehicleNumber },
      ],
    }).sort({ bookingDate: -1, createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("BOOKING HISTORY ERROR:", error);

    return NextResponse.json(
      {
        message: "Error fetching booking history",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
