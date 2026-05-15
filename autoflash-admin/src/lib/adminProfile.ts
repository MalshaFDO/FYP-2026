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
const ADMIN_PROFILE_STORAGE_VERSION = 2;

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: "AutoFlash Admin",
  email: "admin@autoflash.local",
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

    const parsed = JSON.parse(raw) as
      | { version?: number; profile?: Partial<AdminProfile> }
      | Partial<AdminProfile>;

    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      parsed.version === ADMIN_PROFILE_STORAGE_VERSION &&
      parsed.profile &&
      typeof parsed.profile === "object"
    ) {
      const profile = parsed.profile;

      return {
        ...DEFAULT_ADMIN_PROFILE,
        ...profile,
        name: profile.name?.trim() || DEFAULT_ADMIN_PROFILE.name,
        email: profile.email?.trim() || DEFAULT_ADMIN_PROFILE.email,
        phone: profile.phone?.trim() || DEFAULT_ADMIN_PROFILE.phone,
        role: "Admin",
        title: profile.title?.trim() || DEFAULT_ADMIN_PROFILE.title,
        location: profile.location?.trim() || DEFAULT_ADMIN_PROFILE.location,
        bio: profile.bio?.trim() || DEFAULT_ADMIN_PROFILE.bio,
      };
    }

    const profile = DEFAULT_ADMIN_PROFILE;
    window.localStorage.setItem(
      ADMIN_PROFILE_STORAGE_KEY,
      JSON.stringify({
        version: ADMIN_PROFILE_STORAGE_VERSION,
        profile,
      })
    );

    return profile;
  } catch {
    return DEFAULT_ADMIN_PROFILE;
  }
};

export const saveAdminProfile = (profile: AdminProfile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ADMIN_PROFILE_STORAGE_KEY,
    JSON.stringify({
      version: ADMIN_PROFILE_STORAGE_VERSION,
      profile,
    })
  );
};

export const getAdminInitial = (name: string) =>
  (name.trim().charAt(0) || "A").toUpperCase();
