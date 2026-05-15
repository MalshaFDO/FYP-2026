import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/user";
import Vehicle from "@/models/vehicle";
import Booking from "@/models/booking";

const serializeId = (value: any) => value?._id?.toString?.() ?? value?._id ?? value;

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean();
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

    const vehicleByUser = new Map<string, any[]>();
    vehicles.forEach((vehicle: any) => {
      const key = String(vehicle.userId || "");
      if (!vehicleByUser.has(key)) vehicleByUser.set(key, []);
      vehicleByUser.get(key)?.push(vehicle);
    });

    const bookingByPhone = new Map<string, any[]>();
    bookings.forEach((booking: any) => {
      const key = String(booking.mobile || "").replace(/\D/g, "");
      if (!bookingByPhone.has(key)) bookingByPhone.set(key, []);
      bookingByPhone.get(key)?.push(booking);
    });

    const customers = users.map((user: any) => {
      const userVehicles = vehicleByUser.get(String(user._id)) || [];
      const userPhone = String(user.phone || "").replace(/\D/g, "");
      const userBookings = bookingByPhone.get(userPhone) || [];

      return {
        id: serializeId(user),
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        createdAt: user.createdAt,
        vehicleCount: userVehicles.length,
        bookingCount: userBookings.length,
        vehicles: userVehicles.map((vehicle: any) => ({
          id: serializeId(vehicle),
          vehicleNumber: vehicle.vehicleNumber || "",
          vehicleType: vehicle.vehicleType || "",
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          currentOil: vehicle.currentOil || "",
        })),
        lastBooking: userBookings[0]
          ? {
              bookingDate: userBookings[0].bookingDate || userBookings[0].date || "",
              bookingTime: userBookings[0].bookingTime || "",
              status: userBookings[0].status || "",
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error("FETCH CUSTOMERS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
