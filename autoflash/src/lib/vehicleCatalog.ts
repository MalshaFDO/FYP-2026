import { vehicleOilCapacity } from "@/lib/vehicleOilData";

const toTitleCase = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

export type VehicleCatalogEntry = {
  _id?: string;
  category: string;
  make: string;
  model: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
};

const fallbackCatalogEntries: VehicleCatalogEntry[] = Object.keys(vehicleOilCapacity).map((vehicle) => {
  const [make = "", ...modelParts] = vehicle.split(" ");

  return {
    category: toTitleCase(make),
    make: toTitleCase(make),
    model: toTitleCase(modelParts.join(" ")),
    imageUrl: "",
    active: true,
    sortOrder: 0,
  };
});

export const vehicleMakes = Array.from(
  new Set(fallbackCatalogEntries.map((entry) => entry.make).filter(Boolean))
).sort((left, right) => left.localeCompare(right));

export const vehicleModels = Array.from(
  new Set(fallbackCatalogEntries.map((entry) => entry.model).filter(Boolean))
).sort((left, right) => left.localeCompare(right));

export const getVehicleModelsByMake = (make: string) => {
  const normalizedMake = make.trim().toLowerCase();

  if (!normalizedMake) return vehicleModels;

  return Array.from(
    new Set(
      fallbackCatalogEntries
        .filter((entry) => entry.make.toLowerCase() === normalizedMake)
        .map((entry) => entry.model)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));
};

export const getFallbackVehicleCatalog = () => fallbackCatalogEntries;

export async function fetchVehicleCatalog() {
  try {
    const res = await fetch("/api/vehicle-catalog", { cache: "no-store" });
    const data = await res.json();

    if (res.ok && data?.success && Array.isArray(data.entries)) {
      return data.entries as VehicleCatalogEntry[];
    }
  } catch (error) {
    console.error("Fetch vehicle catalog error:", error);
  }

  return fallbackCatalogEntries;
}
