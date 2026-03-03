import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  vehicle: { type: String },
  serviceType: { type: String },

  oilGrade: { type: String },
  mileage: { type: Number },

  customerName: { type: String },
  mobile: { type: String },
  email: { type: String },

  vehicleNumber: { type: String },
  vehicleModel: { type: String },

  bookingDate: { type: String },
  bookingTime: { type: String },
  hourSlot: { type: Number, min: 1, max: 3 },

  totalPrice: { type: Number },
  notes: { type: String },

  status: {
    type: String,
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
