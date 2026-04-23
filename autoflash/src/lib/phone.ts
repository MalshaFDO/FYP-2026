export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const hasPlusPrefix = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";

  if (hasPlusPrefix) {
    return `+${digits}`;
  }

  if (digits.startsWith("94") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+94${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+94${digits}`;
  }

  return digits;
}

export function getPhoneCandidates(value: string) {
  const raw = value.trim();
  const normalized = normalizePhoneNumber(value);
  const digits = normalized.replace(/\D/g, "");
  const localWithZero =
    digits.startsWith("94") && digits.length === 11 ? `0${digits.slice(2)}` : "";

  return Array.from(
    new Set([raw, normalized, digits, localWithZero].filter(Boolean))
  );
}
