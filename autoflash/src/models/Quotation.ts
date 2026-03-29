import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    customerName: String,
    mobile: String,
    vehicle: String,
    vehicleNumber: String,
    oilGrade: String,
    bookingDate: String,
    bookingTime: String,
    totalPrice: Number,

    pdfUrl: String, // 🔥 Cloudinary URL

    status: {
      type: String,
      default: "generated",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", quotationSchema);