import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Vehicle from "@/models/vehicle";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 Get user
    const user = getUserFromToken(req);

    // 🔍 Find vehicles
    const vehicles = await Vehicle.find({
      userId: user.userId,
    });

    return NextResponse.json({
      vehicles,
    });
  } catch (error: any) {
    console.error("GET VEHICLES ERROR:", error);

    return NextResponse.json(
      {
        message: "Error fetching vehicles",
        error: error.message,
      },
      { status: 500 }
    );
  }
}