import { servicePricing } from "./servicePricing";

type VehicleType = keyof typeof servicePricing;
type ServiceKey = keyof (typeof servicePricing)[VehicleType];

export function getServiceItems({
  vehicleType,
  selectedServices,
}: {
  vehicleType: VehicleType;
  selectedServices: string[];
}) {
  const pricing = servicePricing[vehicleType];

  const items = selectedServices.map((service) => ({
    name: formatName(service),
    price: pricing[service as ServiceKey] ?? 0,
  }));

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return { items, total };
}

function formatName(key: string) {
  const map: Record<string, string> = {
    fullService: "Full Service",
    engineWash: "Engine Wash",
    brakeService: "Brake Service",
    oilChange: "Oil Change",
    oilFilter: "Oil Filter",
    scanReport: "Scan Report",
    windowWasher: "Window Washer Fluid",
    caliperGrease: "Caliper Grease",
    brakeCaliperLube: "Brake Caliper Lube",
    brakeDrumCleaning: "Brake Drum Cleaning",
    sumpWasher: "Sump Washer",
    chemicalCost: "Chemical Cost",
    underBodyWash: "Under Body Wash",
    rexine: "Rexine",
    interiorFumigation: "Interior Fumigation",
    n2: "Nitrogen (N2)",
  };

  return map[key] || key;
}
