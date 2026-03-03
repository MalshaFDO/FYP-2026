import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

function getBookingPrice(booking: any) {
  const rawPrice = booking?.totalPrice ?? booking?.price ?? booking?.amount ?? 0;
  const parsedPrice =
    typeof rawPrice === "number" ? rawPrice : Number.parseFloat(String(rawPrice));
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
}

function getBookingDate(booking: any) {
  return booking?.bookingDate || booking?.date || null;
}

export async function GET() {
  await connectDB();

  const bookings = await Booking.find();

  const totalBookings = bookings.length;

  const totalCustomers = new Set(
    bookings.map((b) => b.mobile)
  ).size;

  const pendingCount = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  const confirmedCount = bookings.filter(
    (b) => b.status === "Confirmed"
  ).length;

  const inProgressCount = bookings.filter(
    (b) => b.status === "In Progress"
  ).length;

  const completedCount = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const cancelledCount = bookings.filter(
    (b) => b.status === "Cancelled"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const todaysBookings = bookings.filter(
    (b) => getBookingDate(b) === today
  ).length;

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const totalRevenue = bookings.reduce(
  (sum, b) => sum + getBookingPrice(b),
  0
);

const completedRevenue = bookings
  .filter((b) => b.status === "Completed")
  .reduce((sum, b) => sum + getBookingPrice(b), 0);

const now = new Date();
const currentMonth = now.getUTCMonth();
const currentYear = now.getUTCFullYear();

const monthlyRevenue = bookings
  .filter((b) => {
    if (!b.bookingDate) return false;

    const d = new Date(b.bookingDate);

    return (
      d.getUTCMonth() === currentMonth &&
      d.getUTCFullYear() === currentYear
    );
  })
  .reduce((sum, b) => sum + (b.totalPrice || 0), 0);


  const monthlyMap: Record<string, number> = {};

bookings.forEach((b) => {
  if (!b.bookingDate) return;

  const d = new Date(b.bookingDate);
  const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

  if (!monthlyMap[key]) monthlyMap[key] = 0;

  monthlyMap[key] += b.totalPrice || 0;
});

const monthlyChartData = Object.keys(monthlyMap).map((key) => {
  const [year, month] = key.split("-");
  return {
    month: `${month}/${year}`,
    revenue: monthlyMap[key],
  };
});

 return NextResponse.json({
  totalBookings,
  totalCustomers,
  pendingCount,
  confirmedCount,
  inProgressCount,
  completedCount,
  cancelledCount,
  todaysBookings,
  totalRevenue,
  completedRevenue,
  monthlyRevenue,
  recentBookings,
  monthlyChartData,
});
}
