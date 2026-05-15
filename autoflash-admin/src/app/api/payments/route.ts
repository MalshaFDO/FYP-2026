import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

const serialize = (value: any) => {
  if (value instanceof Date) return value.toISOString();
  if (value?._id?.toString) return value._id.toString();
  return value;
};

export async function GET() {
  try {
    await connectDB();

    const bookings = await Booking.find({
      $or: [{ paidAmount: { $gt: 0 } }, { paymentHistory: { $exists: true, $ne: [] } }],
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const payments = bookings.flatMap((booking: any) => {
      const history = Array.isArray(booking.paymentHistory) ? booking.paymentHistory : [];

      if (history.length === 0 && Number(booking.paidAmount || 0) > 0) {
        return [
          {
            id: `${serialize(booking._id)}-${booking.paymentOrderId || "payment"}`,
            bookingId: serialize(booking._id),
            orderId: booking.paymentOrderId || "",
            customerName: booking.customerName || "",
            mobile: booking.mobile || "",
            vehicleNumber: booking.vehicleNumber || "",
            serviceType: booking.serviceType || "",
            bookingDate: booking.bookingDate || booking.date || "",
            bookingTime: booking.bookingTime || "",
            amount: Number(booking.paidAmount || 0),
            totalPrice: Number(booking.totalPrice || 0),
            remainingAmount: Number(booking.remainingAmount || 0),
            paymentOption: booking.paymentOption || "",
            paymentStage: "initial",
            status: booking.paymentStatus || "Paid",
            paidAt: serialize(booking.updatedAt || booking.createdAt),
          },
        ];
      }

      return history.map((payment: any, index: number) => ({
        id: `${serialize(booking._id)}-${payment.orderId || index}`,
        bookingId: serialize(booking._id),
        orderId: payment.orderId || "",
        customerName: booking.customerName || "",
        mobile: booking.mobile || "",
        vehicleNumber: booking.vehicleNumber || "",
        serviceType: booking.serviceType || "",
        bookingDate: booking.bookingDate || booking.date || "",
        bookingTime: booking.bookingTime || "",
        amount: Number(payment.amount || 0),
        totalPrice: Number(booking.totalPrice || 0),
        remainingAmount: Number(booking.remainingAmount || 0),
        paymentOption: payment.paymentOption || booking.paymentOption || "",
        paymentStage: payment.paymentStage || "initial",
        status: payment.status || booking.paymentStatus || "Paid",
        paidAt: serialize(payment.paidAt || booking.updatedAt || booking.createdAt),
      }));
    });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstanding = bookings.reduce(
      (sum: number, booking: any) => sum + Number(booking.remainingAmount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalPaid,
        outstanding,
        paymentCount: payments.length,
        partialCount: bookings.filter((booking: any) => Number(booking.remainingAmount || 0) > 0)
          .length,
      },
      payments: payments.sort(
        (a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime()
      ),
    });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
