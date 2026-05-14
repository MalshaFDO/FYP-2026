import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

export async function PATCH(req: Request) {
  try {
    const payload = await req.json();
    const bookingId = typeof payload?.bookingId === "string" ? payload.bookingId : "";
    const paidAmount = Number(payload?.paidAmount ?? 0);

    if (!bookingId || paidAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Booking id and paid amount are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const totalPrice = Number(booking.totalPrice ?? payload?.totalPrice ?? 0);
    const nextPaidAmount = Number(booking.paidAmount ?? 0) + paidAmount;
    const remainingAmount = Math.max(0, totalPrice - nextPaidAmount);
    const paymentStatus = remainingAmount === 0 ? "Paid" : "Partially Paid";

    booking.paidAmount = nextPaidAmount;
    booking.remainingAmount = remainingAmount;
    booking.paymentStatus = paymentStatus;
    booking.paymentOrderId = payload?.paymentOrderId || booking.paymentOrderId;
    booking.paymentHistory = [
      ...(Array.isArray(booking.paymentHistory) ? booking.paymentHistory : []),
      {
        orderId: payload?.paymentOrderId,
        amount: paidAmount,
        paymentOption: payload?.paymentOption || "full",
        paymentStage: payload?.paymentStage || "remaining",
        status: paymentStatus,
        paidAt: new Date(),
      },
    ];

    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Update booking payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking payment" },
      { status: 500 }
    );
  }
}
