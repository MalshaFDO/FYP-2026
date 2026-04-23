import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import RecordBook from "@/models/recordBook";
import Booking from "@/models/booking";

const normalizeVehicleNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const normalizePhone = (value: string) => value.replace(/\D/g, "");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildVehicleRegex = (value: string) => {
  const normalized = normalizeVehicleNumber(value);

  if (!normalized) return null;

  const pattern = normalized
    .split("")
    .map((char) => escapeRegex(char))
    .join("[^A-Z0-9]*");

  return new RegExp(`^${pattern}$`, "i");
};

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const vehicleNumber = searchParams.get("vehicleNumber")?.trim();
    const phone = searchParams.get("phone")?.trim() || searchParams.get("mobile")?.trim();

    if (vehicleNumber || phone) {
      const filters = [];
      const bookingFilters = [];

      if (vehicleNumber) {
        const normalizedVehicle = normalizeVehicleNumber(vehicleNumber);
        const vehicleRegex = buildVehicleRegex(vehicleNumber);
        filters.push({ vehicleNumber: normalizedVehicle });
        filters.push({ vehicleNumber: vehicleNumber.toUpperCase() });
        if (vehicleRegex) {
          filters.push({ vehicleNumber: { $regex: vehicleRegex } });
        }
        bookingFilters.push({ vehicleNumber: normalizedVehicle });
        bookingFilters.push({ vehicleNumber: vehicleNumber.toUpperCase() });
        if (vehicleRegex) {
          bookingFilters.push({ vehicleNumber: { $regex: vehicleRegex } });
        }
      }

      if (phone) {
        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone) {
          filters.push({ phone: normalizedPhone });
          filters.push({ phone });
          bookingFilters.push({ mobile: normalizedPhone });
          bookingFilters.push({ mobile: phone });
        }
      }

      const book = await RecordBook.findOne({
        $or: filters,
      });

      const matchingBooking = await Booking.findOne({
        $or: bookingFilters,
      })
        .sort({ createdAt: -1, bookingDate: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        book,
        bookingMatch: matchingBooking || null,
      });
    }

    const books = await RecordBook.find({}).sort({ updatedAt: -1 }).limit(50);
    return NextResponse.json({ success: true, books });
  } catch (error: any) {
    console.error("ADMIN RECORDBOOK GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch record books" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const payload = await req.json();
    const vehicleNumber = payload?.vehicleNumber?.trim();

    if (!vehicleNumber) {
      return NextResponse.json(
        { success: false, error: "Vehicle number is required" },
        { status: 400 }
      );
    }

    const normalizedVehicleNumber = normalizeVehicleNumber(vehicleNumber);
    const sanitizedRecords = Array.isArray(payload.records)
      ? payload.records.map((record: any) => ({
          serviceDate: record?.serviceDate || "",
          odometer: Number(record?.odometer || 0),
          invoiceNumber: record?.invoiceNumber || "",
          performedServices: Array.isArray(record?.performedServices)
            ? record.performedServices
            : [],
          serviceStatuses: Array.isArray(record?.serviceStatuses)
            ? record.serviceStatuses
                .filter(
                  (service: any) =>
                    typeof service?.name === "string" &&
                    typeof service?.status === "string" &&
                    Boolean(service.name.trim()) &&
                    Boolean(service.status.trim())
                )
                .map((service: any) => ({
                  name: service.name.trim(),
                  status: service.status.trim().toUpperCase(),
                }))
            : [],
          engineOil: {
            make: record?.engineOil?.make || "",
            type: record?.engineOil?.type || "",
          },
          transOil: {
            make: record?.transOil?.make || "",
            type: record?.transOil?.type || "",
          },
          diffOil: {
            make: record?.diffOil?.make || "",
          },
          transferOil: {
            type: record?.transferOil?.type || "",
          },
          pSteering: {
            make: record?.pSteering?.make || "",
            type: record?.pSteering?.type || "",
          },
          brakeFluid: {
            make: record?.brakeFluid?.make || "",
            type: record?.brakeFluid?.type || "",
          },
          nextServiceDate: record?.nextServiceDate || "",
          nextServiceKM: Number(record?.nextServiceKM || 0),
          technician: record?.technician || "",
          notes: record?.notes || "",
        }))
      : [];

    await RecordBook.findOneAndUpdate(
      { vehicleNumber: normalizedVehicleNumber },
      {
        $set: {
        vehicleNumber: normalizedVehicleNumber,
        ownerName: payload?.ownerName || "",
        vehicleModel: payload?.vehicleModel || "",
        phone: payload?.phone || "",
        records: sanitizedRecords,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
        new: true,
      }
    );

    const book = await RecordBook.findOne({
      vehicleNumber: normalizedVehicleNumber,
    }).lean();

    return NextResponse.json({ success: true, book });
  } catch (error: any) {
    console.error("ADMIN RECORDBOOK SAVE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save record book" },
      { status: 500 }
    );
  }
}
