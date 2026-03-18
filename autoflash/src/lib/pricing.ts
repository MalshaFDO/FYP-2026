type PricingInput = {
  oilGrade: string;
  vehicle?: string;
};

type PricingOutput = {
  oilPrice: number;
  oilFilter: number;
  serviceCharge: number;
  total: number;
};

export function calculateServiceQuote({
  oilGrade,
  vehicle,
}: PricingInput): PricingOutput {
  let oilPrice = 8500;

  // 🔧 Oil grade pricing logic
  switch (oilGrade) {
    case "10W-40":
      oilPrice = 9000;
      break;
    case "5W-30":
      oilPrice = 8500;
      break;
    case "0W-20":
      oilPrice = 9500;
      break;
    default:
      oilPrice = 8500;
  }

  // 🚗 Vehicle-based adjustment (premium cars)
  if (vehicle) {
    const v = vehicle.toLowerCase();

    if (v.includes("bmw") || v.includes("benz") || v.includes("audi")) {
      oilPrice += 3000;
    }

    if (v.includes("hybrid")) {
      oilPrice += 1500;
    }
  }

  const oilFilter = 2500;
  const serviceCharge = 3000;

  const total = oilPrice + oilFilter + serviceCharge;

  return {
    oilPrice,
    oilFilter,
    serviceCharge,
    total,
  };
}