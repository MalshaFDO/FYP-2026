import mongoose, { Schema } from "mongoose";

const FeatureSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.FeatureSetting) {
  mongoose.deleteModel("FeatureSetting");
}

export default mongoose.models.FeatureSetting ||
  mongoose.model("FeatureSetting", FeatureSettingSchema);
