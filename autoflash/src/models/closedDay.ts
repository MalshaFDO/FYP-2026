import mongoose from "mongoose";

const closedDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "2026-03-14"
    reason: { type: String, default: "Closed by admin" },
  },
  { timestamps: true }
);

export default mongoose.models.ClosedDay ||
  mongoose.model("ClosedDay", closedDaySchema);
