import mongoose, { Schema } from "mongoose";

const ServiceStatusSchema = new Schema(
  {
    name: String,
    status: String,
  },
  { _id: false }
);

const OilMakeTypeSchema = new Schema(
  {
    make: String,
    type: String,
  },
  { _id: false }
);

const OilMakeOnlySchema = new Schema(
  {
    make: String,
  },
  { _id: false }
);

const OilTypeOnlySchema = new Schema(
  {
    type: String,
  },
  { _id: false }
);

const ServiceRecordSchema = new Schema(
  {
    serviceDate: String,
    date: String,
    odometer: Number,
    invoiceNumber: String,
    performedServices: {
      type: [String],
      default: [],
    },
    serviceStatuses: {
      type: [ServiceStatusSchema],
      default: [],
    },
    engineOil: {
      type: OilMakeTypeSchema,
      default: () => ({ make: "", type: "" }),
    },
    transOil: {
      type: OilMakeTypeSchema,
      default: () => ({ make: "", type: "" }),
    },
    diffOil: {
      type: OilMakeOnlySchema,
      default: () => ({ make: "" }),
    },
    transferOil: {
      type: OilTypeOnlySchema,
      default: () => ({ type: "" }),
    },
    pSteering: {
      type: OilMakeTypeSchema,
      default: () => ({ make: "", type: "" }),
    },
    brakeFluid: {
      type: OilMakeTypeSchema,
      default: () => ({ make: "", type: "" }),
    },
    services: {
      oilFilter: String,
      airFilter: String,
      brakePads: String,
      coolant: String,
      engineOil: String,
    },
    nextServiceDate: String,
    nextServiceKM: Number,
    technician: String,
    notes: String,
  },
  { _id: false }
);

const RecordBookSchema = new Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerName: String,
    vehicleModel: String,
    phone: String,
    records: {
      type: [ServiceRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.RecordBook) {
  mongoose.deleteModel("RecordBook");
}

export default mongoose.models.RecordBook || mongoose.model("RecordBook", RecordBookSchema);
