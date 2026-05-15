import mongoose, { Schema, models } from "mongoose";

const VehicleCatalogSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

VehicleCatalogSchema.index({ category: 1, make: 1, model: 1 }, { unique: true });

const VehicleCatalog =
  models.VehicleCatalog || mongoose.model("VehicleCatalog", VehicleCatalogSchema);

export default VehicleCatalog;
