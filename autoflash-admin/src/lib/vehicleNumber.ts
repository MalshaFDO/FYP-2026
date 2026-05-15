export const normalizeVehicleNumber = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

export const formatVehicleNumber = (value: string) => {
  const normalized = normalizeVehicleNumber(value);
  const matched = normalized.match(/^([A-Z]+)(\d+)$/);

  if (!matched) return normalized;

  return `${matched[1]} - ${matched[2]}`;
};

export const normalizeVehicleNumberForStorage = (value: string) =>
  formatVehicleNumber(value);

export const getVehicleNumberRegex = (value: string) => {
  const normalized = normalizeVehicleNumber(value);
  const flexiblePattern = normalized
    .split("")
    .map((char) => `${char}[^A-Z0-9]*`)
    .join("");

  return new RegExp(`^${flexiblePattern}$`, "i");
};
