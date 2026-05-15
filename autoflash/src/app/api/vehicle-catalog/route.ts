import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import VehicleCatalog from "@/models/vehicleCatalog";

const serialize = (entry: any) => ({
  ...entry,
  _id: entry?._id?.toString?.() ?? entry?._id,
  createdAt: entry?.createdAt instanceof Date ? entry.createdAt.toISOString() : entry?.createdAt,
  updatedAt: entry?.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry?.updatedAt,
});

export async function GET() {
  try {
    await connectDB();
    const entries = await VehicleCatalog.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, entries: entries.map(serialize) });
  } catch (error: any) {
    console.error("FETCH VEHICLE CATALOG ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch vehicle catalog" },
      { status: 500 }
    );
  }
}
