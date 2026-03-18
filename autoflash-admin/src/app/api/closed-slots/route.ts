import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ClosedSlot from "@/models/ClosedSlot";
import Booking from "@/models/booking";

export async function GET() {
  await connectDB();
  const slots = await ClosedSlot.find({});
  return NextResponse.json({ success: true, slots });
}

export async function POST(req: Request) {
  await connectDB();

  const { date, startTime, endTime, reason } =
    await req.json();

  if (!date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await ClosedSlot.create({
    date,
    startTime,
    endTime,
    reason: reason || "Closed by admin",
  });

  // AUTO CANCEL BOOKINGS
  const bookings = await Booking.find({
    bookingDate: date,
    status: { $ne: "Cancelled" },
  });

  const parseTime = (time: string) => {
    const [clock, period] = time.split(" ");
    let [hour] = clock.split(":").map(Number);
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return hour;
  };

  const startHour = parseTime(startTime);
  const endHour = parseTime(endTime);

  for (const booking of bookings) {
    const bookingHour = parseTime(booking.bookingTime);

    if (bookingHour >= startHour && bookingHour < endHour) {
      booking.status = "Cancelled";
      await booking.save();

      // Here you can trigger email + whatsapp cancel
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await ClosedSlot.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}