import { vehicleOilCapacity } from "@/lib/vehicleOilData";

const toTitleCase = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const catalogEntries = Object.keys(vehicleOilCapacity).map((vehicle) => {
  const [make = "", ...modelParts] = vehicle.split(" ");

  return {
    make: toTitleCase(make),
    model: toTitleCase(modelParts.join(" ")),
  };
});

export const vehicleMakes = Array.from(
  new Set(catalogEntries.map((entry) => entry.make).filter(Boolean))
).sort((left, right) => left.localeCompare(right));

export const vehicleModels = Array.from(
  new Set(catalogEntries.map((entry) => entry.model).filter(Boolean))
).sort((left, right) => left.localeCompare(right));

export const getVehicleModelsByMake = (make: string) => {
  const normalizedMake = make.trim().toLowerCase();

  if (!normalizedMake) return vehicleModels;

  return Array.from(
    new Set(
      catalogEntries
        .filter((entry) => entry.make.toLowerCase() === normalizedMake)
        .map((entry) => entry.model)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));
};
