export type AdminProfile = {
  name: string;
  email: string;
  phone: string;
  role: "Admin";
  title: string;
  location: string;
  bio: string;
};

export const ADMIN_PROFILE_STORAGE_KEY = "autoflash-admin-profile";

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: "Nadun Thushara Peiris",
  email: "nadunthusharapeiris@gmail.com",
  phone: "+94 76 423 5631",
  role: "Admin",
  title: "AutoFlash Administrator",
  location: "Colombo, Sri Lanka",
  bio: "Responsible for bookings, service pricing, vehicle records, and daily admin operations.",
};

export const loadAdminProfile = (): AdminProfile => {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_ADMIN_PROFILE;

    const parsed = JSON.parse(raw) as Partial<AdminProfile>;
    return {
      ...DEFAULT_ADMIN_PROFILE,
      ...parsed,
      name: parsed.name?.trim() || DEFAULT_ADMIN_PROFILE.name,
      email: parsed.email?.trim() || DEFAULT_ADMIN_PROFILE.email,
      phone: parsed.phone?.trim() || DEFAULT_ADMIN_PROFILE.phone,
      role: "Admin",
      title: parsed.title?.trim() || DEFAULT_ADMIN_PROFILE.title,
      location: parsed.location?.trim() || DEFAULT_ADMIN_PROFILE.location,
      bio: parsed.bio?.trim() || DEFAULT_ADMIN_PROFILE.bio,
    };
  } catch {
    return DEFAULT_ADMIN_PROFILE;
  }
};

export const saveAdminProfile = (profile: AdminProfile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const getAdminInitial = (name: string) =>
  (name.trim().charAt(0) || "A").toUpperCase();
