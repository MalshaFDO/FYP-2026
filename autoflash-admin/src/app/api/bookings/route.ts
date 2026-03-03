import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

const generateBookingRef = () =>
  `AF-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;

// GET all bookings
export async function GET() {
  await connectDB();
  const bookings = await Booking.find().sort({ createdAt: -1 });
  return NextResponse.json(bookings);
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
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// UPDATE booking status
export async function PATCH(req: Request) {
  await connectDB();

  const { id, status } = await req.json();

  await Booking.findByIdAndUpdate(id, { status });

  return NextResponse.json({ message: "Status updated" });
}
