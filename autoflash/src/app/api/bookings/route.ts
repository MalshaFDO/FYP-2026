import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    await connectDB();

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

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find(
      {},
      { bookingDate: 1, bookingTime: 1, hourSlot: 1, status: 1 }
    ).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
