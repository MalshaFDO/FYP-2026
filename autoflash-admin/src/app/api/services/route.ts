import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ServiceCatalog from "@/models/serviceCatalog";

const normalizeNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const serialize = (service: any) => {
  const data = service?.toObject?.() ?? service ?? {};

  return {
    ...data,
  _id: service?._id?.toString?.() ?? service?._id,
    createdAt: data?.createdAt instanceof Date ? data.createdAt.toISOString() : data?.createdAt,
    updatedAt: data?.updatedAt instanceof Date ? data.updatedAt.toISOString() : data?.updatedAt,
  };
};

const parsePayload = (payload: any = {}) => ({
  name: String(payload?.name || "").trim(),
  category: String(payload?.category || "General").trim() || "General",
  description: String(payload?.description || "").trim(),
  price: normalizeNumber(payload?.price),
  active: payload?.active !== false,
  sortOrder: normalizeNumber(payload?.sortOrder),
});

export async function GET() {
  try {
    await connectDB();
    const services = await ServiceCatalog.find({})
      .sort({ active: -1, sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      services: services.map(serialize),
    });
  } catch (error: any) {
    console.error("FETCH SERVICES ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = parsePayload(await req.json());

    if (!payload.name) {
      return NextResponse.json(
        { success: false, error: "Service name is required" },
        { status: 400 }
      );
    }

    const service = await ServiceCatalog.create(payload);

    return NextResponse.json({ success: true, service: serialize(service) }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE SERVICE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json({ success: false, error: "Service id is required" }, { status: 400 });
    }

    const payload = parsePayload(body);

    if (!payload.name) {
      return NextResponse.json(
        { success: false, error: "Service name is required" },
        { status: 400 }
      );
    }

    const service = await ServiceCatalog.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, service: serialize(service) });
  } catch (error: any) {
    console.error("UPDATE SERVICE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Service id is required" }, { status: 400 });
    }

    await ServiceCatalog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE SERVICE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
