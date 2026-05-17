import mongoose, { Schema } from "mongoose";

const ServiceCatalogSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
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

ServiceCatalogSchema.index({ name: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.ServiceCatalog) {
  mongoose.deleteModel("ServiceCatalog");
}

export default mongoose.models.ServiceCatalog ||
  mongoose.model("ServiceCatalog", ServiceCatalogSchema);
