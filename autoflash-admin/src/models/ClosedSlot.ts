// src/models/ClosedSlot.ts

import mongoose from "mongoose";

const closedSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, default: "Closed by admin" },
  },
  { timestamps: true }
);

export default mongoose.models.ClosedSlot ||
  mongoose.model("ClosedSlot", closedSlotSchema);