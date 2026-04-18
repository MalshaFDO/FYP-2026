import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  vehicle: { type: String },
  serviceType: { type: String },
  serviceCategory: { type: String, enum: ["bodywash", "fullservice"] },

  oilGrade: { type: String },
  oilBrand: { type: String },
  mileage: { type: Number },
  additionalServices: [
    {
      id: { type: Number },
      name: { type: String },
      time: { type: String },
      price: { type: Number },
    },
  ],

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

  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
},
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
