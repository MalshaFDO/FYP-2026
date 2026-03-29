import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

const generateBookingRef = () =>
  `AF-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

// GET all bookings
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Fetch admin bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings",
        details:
          process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// CREATE booking
export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await req.json();

    if (!payload?.bookingDate || !payload?.bookingTime) {
      return NextResponse.json(
        { success: false, error: "Booking date and time are required" },
        { status: 400 }
      );
    }

    const existingCount = await Booking.countDocuments({
      bookingDate: payload.bookingDate,
      bookingTime: payload.bookingTime,
    });

    if (existingCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: `All 3 slots are already booked for ${payload.bookingDate} at ${payload.bookingTime}`,
        },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      ...payload,
      bookingRef: payload?.bookingRef || generateBookingRef(),
      totalPrice: Number(payload?.totalPrice ?? 0),
      hourSlot: existingCount + 1,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking",
        details:
          process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// UPDATE booking status
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Booking id and status are required" },
        { status: 400 }
      );
    }

    await Booking.findByIdAndUpdate(id, { status });

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update booking status",
        details:
          process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined,
      },
      { status: 500 }
    );
  }
}
