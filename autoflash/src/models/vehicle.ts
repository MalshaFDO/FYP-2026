import mongoose, { Schema, models } from "mongoose";

const VehicleSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String, // sedan, suv, bike
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
    },
    currentOil: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle =
  models.Vehicle || mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;