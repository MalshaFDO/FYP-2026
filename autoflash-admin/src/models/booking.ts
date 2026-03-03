import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    vehicle: String,
    vehicleNumber: String,
    oilGrade: String,
    serviceType: String,
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
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
