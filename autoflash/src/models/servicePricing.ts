import mongoose, { Schema, models } from "mongoose";

const pricingRowSchema = new Schema(
  {
    quickWash: { type: Number, default: 0 },
    bodywashVacuum: { type: Number, default: 0 },
    washVacuumWax: { type: Number, default: 0 },
    fullBodywash: { type: Number, default: 0 },
    fullService: { type: Number, default: 0 },
    engineWash: { type: Number, default: 0 },
    brakeService: { type: Number, default: 0 },
    oilChange: { type: Number, default: 0 },
    oilFilter: { type: Number, default: 0 },
    underBodyWash: { type: Number, default: 0 },
    windowWasher: { type: Number, default: 0 },
    caliperGrease: { type: Number, default: 0 },
    brakeCaliperLube: { type: Number, default: 0 },
    brakeDrumCleaning: { type: Number, default: 0 },
    sumpWasher: { type: Number, default: 0 },
    chemicalCost: { type: Number, default: 0 },
    rexine: { type: Number, default: 0 },
    interiorFumigation: { type: Number, default: 0 },
    n2: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
  },
  { _id: false }
);

const vehicleAddonSchema = new Schema(
  {
    sedan: { type: Number, default: 0 },
    suv: { type: Number, default: 0 },
    pickup: { type: Number, default: 0 },
    minivan: { type: Number, default: 0 },
  },
  { _id: false }
);

const ServicePricingSchema = new Schema(
  {
    bodywash: {
      sedan: { type: pricingRowSchema, default: () => ({}) },
      suv: { type: pricingRowSchema, default: () => ({}) },
      pickup: { type: pricingRowSchema, default: () => ({}) },
      minivan: { type: pricingRowSchema, default: () => ({}) },
    },
    fullService: {
      sedan: { type: pricingRowSchema, default: () => ({}) },
      suv: { type: pricingRowSchema, default: () => ({}) },
      pickup: { type: pricingRowSchema, default: () => ({}) },
      minivan: { type: pricingRowSchema, default: () => ({}) },
    },
    bodywashAddons: {
      leatherTreatment: { type: Number, default: 3850 },
      rainX: { type: Number, default: 650 },
      tarRemoval: { type: Number, default: 650 },
      engineWash: { type: vehicleAddonSchema, default: () => ({}) },
      headLightPolish: { type: Number, default: 1200 },
      underBodyWax: { type: vehicleAddonSchema, default: () => ({}) },
    },
    fullServiceAddons: {
      wheelAlignment: { type: Number, default: 3500 },
      brakeFluid: { type: Number, default: 1800 },
      coolantFlush: { type: Number, default: 2500 },
      batteryHealth: { type: Number, default: 750 },
      tireRotation: { type: Number, default: 1500 },
      engineWash: { type: vehicleAddonSchema, default: () => ({}) },
      quickWash: { type: vehicleAddonSchema, default: () => ({}) },
      bodywashVacuum: { type: vehicleAddonSchema, default: () => ({}) },
      washVacuumWax: { type: vehicleAddonSchema, default: () => ({}) },
      fullBodywash: { type: vehicleAddonSchema, default: () => ({}) },
    },
    quote: {
      oilFilter: { type: Number, default: 2500 },
      serviceCharge: { type: Number, default: 3000 },
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.ServicePricing) {
  mongoose.deleteModel("ServicePricing");
}

export default models.ServicePricing || mongoose.model("ServicePricing", ServicePricingSchema);
