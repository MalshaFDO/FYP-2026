import { vehicleOilCapacity } from "./vehicleOilData";
import { oilPricing } from "./oilPricing";

export function calculateServiceQuote({
  oilGrade,
  vehicle,
  brand = "mobil",
}: {
  oilGrade: string;
  vehicle?: string;
  brand?: keyof typeof oilPricing;
}) {
  const key = vehicle?.toLowerCase() || "";

  // 🔥 Get liters
  let liters = 3.5; // default fallback

  for (const v in vehicleOilCapacity) {
    if (key.includes(v)) {
      liters = vehicleOilCapacity[v];
      break;
    }
  }

  // 🔥 Get price per liter
  const brandPrices = oilPricing[brand] || {};
  const pricePerLiter = brandPrices[oilGrade] || 3500;

  const oilPrice = liters * pricePerLiter;

  const oilFilter = 2500;
  const serviceCharge = 3000;

  const total = Math.round(oilPrice + oilFilter + serviceCharge);

  return {
    liters,
    pricePerLiter,
    oilPrice,
    oilFilter,
    serviceCharge,
    total,
  };
}