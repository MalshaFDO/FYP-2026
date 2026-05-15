import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    vehicle: String,
    vehicleNumber: String,
    oilGrade: String,
    serviceType: String,
    additionalServices: [
      {
        id: Number,
        name: String,
        time: String,
        price: Number,
      },
    ],
    customerName: String,
    mobile: String,
    email: String,
    mileage: Number,
    date: String,
    bookingDate: String,
    bookingTime: String,
    bookingRef: String,
    hourSlot: Number,
    venue: String,
    status: {
      type: String,
      default: "Pending",
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    serviceCategory: String,
    paymentStatus: String,
    paymentOption: String,
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentOrderId: String,
    paymentHistory: [
      {
        orderId: String,
        amount: Number,
        paymentOption: String,
        paymentStage: String,
        status: String,
        paidAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
