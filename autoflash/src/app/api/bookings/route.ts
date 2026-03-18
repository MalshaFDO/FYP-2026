import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";
import ClosedDay from "@/models/closedDay";
import ClosedSlot from "@/models/ClosedSlot";

const BODYWASH_LIMIT = 3;
const FULLSERVICE_LIMIT = 2;

type ServiceCategory = "bodywash" | "fullservice";

function normalizeServiceCategory(type?: string | null): ServiceCategory | null {
  if (!type) return null;
  const key = type.trim().toLowerCase();

  if (key.includes("bodywash") || key.includes("body wash")) return "bodywash";
  if (key === "full" || key.includes("full service")) return "fullservice";
  if (key === "oil" || key.includes("oil change")) return "fullservice";
  if (key === "fullservice") return "fullservice";

  return null;
}

function inferServiceCategory(type?: string | null): ServiceCategory {
  return normalizeServiceCategory(type) ?? "bodywash";
}

function getSlotLimit(category: ServiceCategory) {
  return category === "fullservice" ? FULLSERVICE_LIMIT : BODYWASH_LIMIT;
}

function parseTimeSlot(date: string, time: string) {
  const [clock, meridiemRaw] = time.split(" ");
  const [hourRaw, minuteRaw] = clock.split(":").map(Number);
  const meridiem = meridiemRaw.toLowerCase();
  let hour = hourRaw;

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const slotDateTime = new Date(`${date}T00:00:00`);
  slotDateTime.setHours(hour, minuteRaw || 0, 0, 0);
  return slotDateTime;
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payload = await req.json();
    await connectDB();

    if (!payload?.bookingDate || !payload?.bookingTime) {
      return NextResponse.json(
        { success: false, error: "Booking date and time are required" },
        { status: 400 }
      );
    }

    const serviceCategory = inferServiceCategory(
      searchParams.get("type") || payload?.serviceCategory || payload?.serviceType
    );
    const slotLimit = getSlotLimit(serviceCategory);

    const existingCount = await Booking.countDocuments({
      bookingDate: payload.bookingDate,
      bookingTime: payload.bookingTime,
      serviceCategory,
      status: { $ne: "Cancelled" },
    });

    if (existingCount >= slotLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `All ${slotLimit} slots are already booked for ${payload.bookingDate} at ${payload.bookingTime}`,
        },
        { status: 409 }
      );
    }

    const closed = await ClosedDay.findOne({
      date: payload.bookingDate,
    });

    if (closed) {
      return NextResponse.json(
        { error: `Bookings are closed on this date: ${closed.reason}` },
        { status: 400 }
      );
    }

    const closedSlots = await ClosedSlot.find({
      date: payload.bookingDate,
    });

    for (const slot of closedSlots) {
      const slotDateTime = parseTimeSlot(payload.bookingDate, payload.bookingTime);
      const start = parseTimeSlot(payload.bookingDate, slot.startTime);
      const end = parseTimeSlot(payload.bookingDate, slot.endTime);

      if (slotDateTime >= start && slotDateTime < end) {
        return NextResponse.json(
          { error: `This time is closed: ${slot.reason ?? "Closed"}` },
          { status: 400 }
        );
      }
    }

    const booking = await Booking.create({
      ...payload,
      serviceCategory,
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
    const rawBookings = await Booking.find(
      {},
      { bookingDate: 1, bookingTime: 1, hourSlot: 1, status: 1, serviceType: 1, serviceCategory: 1 }
    ).sort({ createdAt: -1 });

    const bookings = rawBookings.map((booking) => {
      const obj = booking.toObject();
      return {
        ...obj,
        serviceCategory: inferServiceCategory(obj.serviceCategory || obj.serviceType),
      };
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
