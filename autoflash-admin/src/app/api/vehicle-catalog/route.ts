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
    const entries = await VehicleCatalog.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, entries: entries.map(serialize) });
  } catch (error: any) {
    console.error("FETCH VEHICLE CATALOG ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch vehicle catalog" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await req.json();
    const category = String(payload?.category || "").trim();
    const make = String(payload?.make || "").trim();
    const model = String(payload?.model || "").trim();

    if (!category || !make || !model) {
      return NextResponse.json(
        { success: false, error: "Category, make, and model are required" },
        { status: 400 }
      );
    }

    const entry = await VehicleCatalog.findOneAndUpdate(
      payload?.id ? { _id: payload.id } : { category, make, model },
      {
        $set: {
          category,
          make,
          model,
          imageUrl: String(payload?.imageUrl || ""),
          active: payload?.active !== false,
          sortOrder: Number(payload?.sortOrder || 0),
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, entry: serialize(entry) });
  } catch (error: any) {
    console.error("SAVE VEHICLE CATALOG ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save vehicle catalog" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const payload = await req.json();
    const id = String(payload?.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry id is required" },
        { status: 400 }
      );
    }

    const entry = await VehicleCatalog.findByIdAndUpdate(
      id,
      {
        $set: {
          category: String(payload?.category || "").trim(),
          make: String(payload?.make || "").trim(),
          model: String(payload?.model || "").trim(),
          imageUrl: String(payload?.imageUrl || ""),
          active: payload?.active !== false,
          sortOrder: Number(payload?.sortOrder || 0),
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, entry: serialize(entry) });
  } catch (error: any) {
    console.error("UPDATE VEHICLE CATALOG ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update vehicle catalog" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry id is required" },
        { status: 400 }
      );
    }

    await VehicleCatalog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE VEHICLE CATALOG ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete vehicle catalog" },
      { status: 500 }
    );
  }
}
