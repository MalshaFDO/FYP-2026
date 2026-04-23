"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./record.module.css";

interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  vehicleType: string;
}

interface Booking {
  _id: string;
  serviceType?: string;
  serviceCategory?: string;
  bookingDate?: string;
  bookingTime?: string;
  totalPrice?: number;
  status?: string;
  notes?: string;
}

interface RecordEntry {
  _id?: string;
  serviceDate?: string;
  date?: string;
  odometer?: number;
  invoiceNumber?: string;
  performedServices?: string[];
  serviceStatuses?: Array<{
    name?: string;
    status?: string;
  }>;
  engineOil?: {
    make?: string;
    type?: string;
  };
  transOil?: {
    make?: string;
    type?: string;
  };
  diffOil?: {
    make?: string;
  };
  transferOil?: {
    type?: string;
  };
  pSteering?: {
    make?: string;
    type?: string;
  };
  brakeFluid?: {
    make?: string;
    type?: string;
  };
  nextServiceDate?: string;
  nextServiceKM?: number;
  technician?: string;
  notes?: string;
}

interface RecordBook {
  _id: string;
  vehicleNumber: string;
  ownerName?: string;
  vehicleModel?: string;
  phone?: string;
  records: RecordEntry[];
}

type ViewMode = "history" | "recordbook";
type ImportantSectionKey =
  | "engineOil"
  | "transOil"
  | "diffOil"
  | "transferOil"
  | "pSteering"
  | "brakeFluid";

const OTHER_SERVICE_ITEMS = [
  "Injector Cleaning",
  "A/C Cleaning",
  "Detailing",
  "Tune-up",
  "Engine Flush",
];

const FILTER_ITEMS = [
  "Oil Filter",
  "Fuel Filter",
  "A/C Filter",
  "Air Filter",
  "Wiper Blades",
];

const HEALTH_CHECK_ITEMS = [
  "Tyre Rotation",
  "Tyre Pressure",
  "Brake Liners",
  "Brake Pads",
  "Drive Belts",
  "Battery Fluid",
  "Radiator",
  "Drive Shaft Boots",
  "St. Rack Boot",
  "Lamps",
];

const OIL_FLUID_ITEMS = [
  "Engine Oil",
  "Transmission",
  "Differential",
  "Brake Fluid",
  "Clutch Fluid",
  "P.S. Fluid",
  "Coolant",
  "Win. Washing",
];

const EXTRA_ITEMS = ["Engine Wash", "HV Battery Blower Cleaning"];

const GRID_ROW_COUNT = 15;
const ALL_RECORD_ITEMS = [
  ...OTHER_SERVICE_ITEMS,
  ...FILTER_ITEMS,
  ...HEALTH_CHECK_ITEMS,
  ...OIL_FLUID_ITEMS,
  ...EXTRA_ITEMS,
];

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatMoney = (value?: number) =>
  typeof value === "number" ? `LKR ${value.toLocaleString()}` : "-";

const formatVehicleNumber = (value?: string) => {
  if (!value) return "-";

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const matched = normalized.match(/^([A-Z]+)[-]?(\d+)$/);

  if (!matched) return value;

  return `${matched[1]} - ${matched[2]}`;
};

const normalizeServiceName = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");

const CHECKBOX_ONLY_SERVICES = new Set(
  ["Detailing", "Engine Flush", "Tune-up", "Wiper Blades", "Engine Wash"].map((name) =>
    normalizeServiceName(name)
  )
);

const isCheckboxOnlyService = (label: string) =>
  CHECKBOX_ONLY_SERVICES.has(normalizeServiceName(label));

const getServiceStatus = (entry: RecordEntry | undefined, label: string) => {
  const target = normalizeServiceName(label);
  const matchedStatus = (entry?.serviceStatuses || []).find((service) => {
    const serviceName = typeof service?.name === "string" ? normalizeServiceName(service.name) : "";
    return serviceName.includes(target) || target.includes(serviceName);
  });

  if (matchedStatus?.status) {
    const normalizedStatus = matchedStatus.status.trim().toUpperCase();

    if (normalizedStatus === "YES") return "✓";
    if (normalizedStatus === "NO") return "✕";

    return normalizedStatus;
  }

  return (entry?.performedServices || []).some(
    (service) => normalizeServiceName(service).includes(target) || target.includes(normalizeServiceName(service))
  )
    ? isCheckboxOnlyService(label)
      ? "✓"
      : "C"
    : "";
};

const getImportantValue = (
  entry: RecordEntry | undefined,
  section: ImportantSectionKey,
  field: string
) => {
  const sectionValue = entry?.[section] as Record<string, string | undefined> | undefined;
  return sectionValue?.[field] || "";
};

const getRecordTimestamp = (entry: RecordEntry, index: number) => {
  const rawDate = entry.serviceDate || entry.date;
  const parsed = rawDate ? new Date(rawDate).getTime() : Number.NaN;
  return Number.isNaN(parsed) ? index : parsed;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const parseJsonResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      res.ok
        ? "The server returned an unexpected response."
        : `Request failed with status ${res.status}.`
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("The server returned invalid JSON.");
  }
};

export default function RecordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordBookEnabled, setRecordBookEnabled] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [history, setHistory] = useState<Booking[]>([]);
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [historyServiceFilter, setHistoryServiceFilter] = useState("all");
  const [recordBook, setRecordBook] = useState<RecordBook | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("history");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formProfileImage, setFormProfileImage] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sendingCurrentPhoneOtp, setSendingCurrentPhoneOtp] = useState(false);
  const [currentPhoneOtpSent, setCurrentPhoneOtpSent] = useState(false);
  const [currentPhoneOtp, setCurrentPhoneOtp] = useState("");
  const [currentPhoneVerified, setCurrentPhoneVerified] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedToken =
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("accessToken");

    setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const res = await fetch("/api/feature-settings/e-record-book", {
          cache: "no-store",
        });
        const data = await parseJsonResponse(res);

        if (!res.ok || !data?.success) {
          throw new Error(data.message || "Failed to load e-record book status");
        }

        setRecordBookEnabled(Boolean(data.enabled));
      } catch (err: any) {
        console.error("RECORD PAGE FEATURE STATUS ERROR:", err);
        setRecordBookEnabled(false);
      }
    };

    fetchFeatureStatus();
  }, []);

  useEffect(() => {
    if (token === null) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        const nextVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
        const nextUser = data.user ?? null;

        setUser(nextUser);
        setFormName(nextUser?.name || "");
        setFormEmail(nextUser?.email || "");
        setFormProfileImage(nextUser?.profileImage || "");
        setNewPhone("");
        setVehicles(nextVehicles);
        setSelectedVehicleId((current) => current || nextVehicles[0]?._id || "");
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedVehicleId) {
      setHistory([]);
      setRecordBook(null);
      setBookOpen(false);
      return;
    }

    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const historyRes = await fetch(`/api/bookings/history?vehicleId=${selectedVehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const historyData = await parseJsonResponse(historyRes);

        if (!historyRes.ok) {
          throw new Error(historyData.message || "Failed to load history");
        }

        setHistory(Array.isArray(historyData.bookings) ? historyData.bookings : []);

        if (!recordBookEnabled) {
          setRecordBook(null);
          setBookOpen(false);
          return;
        }

        const bookRes = await fetch(`/api/recordbook/my?vehicleId=${selectedVehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bookData = await parseJsonResponse(bookRes);

        if (!bookRes.ok) {
          throw new Error(bookData.message || "Failed to load record book");
        }

        setRecordBook(bookData.book ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [recordBookEnabled, selectedVehicleId, token]);

  useEffect(() => {
    if (!recordBookEnabled && viewMode === "recordbook") {
      setViewMode("history");
      setBookOpen(false);
    }
  }, [recordBookEnabled, viewMode]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle._id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles]
  );
  const historyServiceOptions = useMemo(() => {
    return Array.from(
      new Set(
        history
          .map((booking) => booking.serviceType || booking.serviceCategory || "")
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [history]);
  const filteredHistory = useMemo(() => {
    return history.filter((booking) => {
      const matchesDate = historyDateFilter
        ? (booking.bookingDate || "").slice(0, 10) === historyDateFilter
        : true;
      const bookingService = booking.serviceType || booking.serviceCategory || "";
      const matchesService =
        historyServiceFilter === "all" ? true : bookingService === historyServiceFilter;

      return matchesDate && matchesService;
    });
  }, [history, historyDateFilter, historyServiceFilter]);
  const orderedRecordEntries = useMemo(() => {
    if (!recordBook?.records?.length) return [];

    return [...recordBook.records].sort((left, right) => {
      const leftIndex = recordBook.records.indexOf(left);
      const rightIndex = recordBook.records.indexOf(right);
      return getRecordTimestamp(left, leftIndex) - getRecordTimestamp(right, rightIndex);
    });
  }, [recordBook]);
  const latestRecordEntry = orderedRecordEntries[orderedRecordEntries.length - 1];

  const handleLoginRedirect = () => {
    window.localStorage.setItem("redirectAfterLogin", "/record");
    window.location.href = "/login";
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("redirectAfterLogin");
    window.location.href = "/login";
  };

  const handleProfileSave = async () => {
    if (!token) return;

    try {
      setSavingProfile(true);
      setError("");
      setSaveMessage("");

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          profileImage: formProfileImage,
          newPhone,
          currentPhoneOtp,
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      setFormName(data.user?.name || "");
      setFormEmail(data.user?.email || "");
      setFormProfileImage(data.user?.profileImage || "");
      setNewPhone("");
      setCurrentPhoneOtp("");
      setCurrentPhoneOtpSent(false);
      setCurrentPhoneVerified(false);
      setIsEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageFile = async (file?: File) => {
    if (!isEditing) return;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image smaller than 2MB.");
      return;
    }

    try {
      setError("");
      const dataUrl = await readFileAsDataUrl(file);
      setFormProfileImage(dataUrl);
      setSaveMessage("Picture selected. Click Save Profile to update it.");
    } catch (err: any) {
      setError(err.message || "Failed to load selected image");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await handleImageFile(file);
    event.target.value = "";
  };

  const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragActive(false);
    await handleImageFile(event.dataTransfer.files?.[0]);
  };

  const hasProfileImage = Boolean(formProfileImage);
  const phoneChanged = Boolean(newPhone.trim());

  const profileInitial = (formName || user?.name || "U").trim().charAt(0).toUpperCase();

  const resetEditForm = () => {
    setFormName(user?.name || "");
    setFormEmail(user?.email || "");
    setFormProfileImage(user?.profileImage || "");
    setNewPhone("");
    setCurrentPhoneOtp("");
    setCurrentPhoneOtpSent(false);
    setCurrentPhoneVerified(false);
    setError("");
    setSaveMessage("");
    setIsEditing(false);
    setAvatarMenuOpen(false);
  };

  const handleSendCurrentPhoneOtp = async () => {
    const targetPhone = (user?.phone || "").trim();

    if (!targetPhone) {
      setError("Current mobile number is not available.");
      return;
    }

    try {
      setSendingCurrentPhoneOtp(true);
      setError("");
      setSaveMessage("");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: targetPhone }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setCurrentPhoneOtpSent(true);
      setSaveMessage("OTP sent to your current mobile number.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSendingCurrentPhoneOtp(false);
    }
  };

  const handleOpenRecordBook = () => {
    if (!recordBookEnabled) {
      setError("E-service record book is not activated by admin yet.");
      setViewMode("history");
      return;
    }

    setViewMode("recordbook");
    setBookOpen(false);
  };

  if (!token) {
    return (
      <main className={styles.page}>
        <section className={styles.loginCard}>
          <p className={styles.kicker}>User Profile</p>
          <h1>Login to view your profile and vehicle records</h1>
          <p>
            After login, you will be able to see your name, mobile number, vehicle
            details, service history, and your read-only e-service record book.
          </p>
          <button className={styles.primaryButton} onClick={handleLoginRedirect}>
            Login with OTP
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>User Profile</p>
          <h1>Your vehicle account</h1>
          <p className={styles.heroText}>
            You can manage your personal profile here, while service history and the
            e-service record book remain view-only for customers.
          </p>
        </div>

        <div className={styles.heroActions}>
          {vehicles.length > 1 && (
            <label className={styles.selectorWrap}>
              <span>Select Vehicle</span>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {formatVehicleNumber(vehicle.vehicleNumber)} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </section>

      {loading && <p className={styles.stateText}>Loading profile...</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {saveMessage && <p className={styles.successText}>{saveMessage}</p>}

      {!loading && !error && (
        <>
          <section className={styles.profileGrid}>
            <article className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <h2>Profile</h2>
                <div className={styles.avatarWrap}>
                  <button
                    type="button"
                    className={styles.avatarButton}
                    onClick={() => {
                      if (!isEditing && !hasProfileImage) return;
                      setAvatarMenuOpen((current) => !current);
                    }}
                    onDragOver={(event) => {
                      if (!isEditing) return;
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                  >
                    {formProfileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formProfileImage}
                        alt={formName || "Profile picture"}
                        className={`${styles.avatarImage} ${dragActive ? styles.avatarDragActive : ""}`}
                      />
                    ) : (
                      <div className={`${styles.avatarFallback} ${dragActive ? styles.avatarDragActive : ""}`}>
                        {profileInitial}
                      </div>
                    )}
                  </button>
                  <input
                    id="profile-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.hiddenInput}
                  />
                  {avatarMenuOpen && (
                    <div className={styles.avatarMenu}>
                      <button
                        type="button"
                        className={styles.avatarMenuButton}
                        onClick={() => {
                          if (!hasProfileImage) return;
                          setViewerOpen(true);
                          setAvatarMenuOpen(false);
                        }}
                        disabled={!hasProfileImage}
                      >
                        View Picture
                      </button>
                      <button
                        type="button"
                        className={styles.avatarMenuButton}
                        onClick={() => {
                          fileInputRef.current?.click();
                          setAvatarMenuOpen(false);
                        }}
                        disabled={!isEditing}
                      >
                        Change Picture
                      </button>
                      <button
                        type="button"
                        className={`${styles.avatarMenuButton} ${styles.avatarMenuDanger}`}
                        onClick={() => {
                          setFormProfileImage("");
                          setSaveMessage("Picture removed. Click Save Profile to confirm.");
                          setAvatarMenuOpen(false);
                        }}
                        disabled={!hasProfileImage}
                      >
                        Remove Picture
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGrid}>
                <div>
                  <span>Name</span>
                  {isEditing ? (
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Your name"
                      className={styles.profileInput}
                    />
                  ) : (
                    <strong>{user?.name || "-"}</strong>
                  )}
                </div>
                <div>
                  <span>Email Address</span>
                  {isEditing ? (
                    <input
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={styles.profileInput}
                    />
                  ) : (
                    <strong>{user?.email || "-"}</strong>
                  )}
                </div>
                <div>
                  <span>Mobile Number</span>
                  {isEditing ? (
                    <div className={styles.phoneEditBlock}>
                      <strong>{user?.phone || "-"}</strong>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleSendCurrentPhoneOtp}
                        disabled={sendingCurrentPhoneOtp}
                      >
                        {sendingCurrentPhoneOtp ? "Sending..." : "Send OTP To Current Number"}
                      </button>
                      <input
                        value={currentPhoneOtp}
                        onChange={(e) => {
                          setCurrentPhoneOtp(e.target.value);
                          setCurrentPhoneVerified(false);
                        }}
                        placeholder={
                          currentPhoneOtpSent
                            ? "Enter OTP from current number"
                            : "Send OTP to current number first"
                        }
                        className={styles.profileInput}
                        disabled={!currentPhoneOtpSent}
                      />
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                          if (!currentPhoneOtp.trim()) {
                            setError("Enter the OTP sent to your current number.");
                            return;
                          }
                          setError("");
                          setCurrentPhoneVerified(true);
                          setSaveMessage("Current mobile number verified. Now you can enter a new number.");
                        }}
                        disabled={!currentPhoneOtpSent}
                      >
                        Verify OTP
                      </button>
                      {currentPhoneVerified && (
                        <input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Enter new mobile number"
                          className={styles.profileInput}
                        />
                      )}
                    </div>
                  ) : (
                    <strong>{user?.phone || "-"}</strong>
                  )}
                </div>
                <div>
                  <span>Vehicle Number</span>
                  <strong>{formatVehicleNumber(selectedVehicle?.vehicleNumber)}</strong>
                </div>
                <div>
                  <span>Vehicle</span>
                  <strong>
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                      : "-"}
                  </strong>
                </div>
              </div>

              <div className={styles.profileFooter}>
                {isEditing ? (
                  <>
                    <button
                      className={styles.primaryButton}
                      onClick={handleProfileSave}
                      disabled={savingProfile || (phoneChanged && !currentPhoneVerified)}
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={resetEditForm}
                      disabled={savingProfile}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => {
                      setIsEditing(true);
                      setSaveMessage("");
                      setError("");
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <p className={styles.profileHelper}>
                Use edit mode to update your profile. To change the mobile number,
                first verify your current number with an OTP, then enter the new
                number.
              </p>
            </article>

            <article className={styles.profileCard}>
              <h2>Quick Actions</h2>
              <div className={styles.buttonColumn}>
                <button
                  className={`${styles.actionButton} ${
                    viewMode === "history" ? styles.activeButton : ""
                  }`}
                  onClick={() => setViewMode("history")}
                >
                  Look Vehicle Services History
                </button>
                {recordBookEnabled && (
                  <button
                    className={`${styles.actionButton} ${
                      viewMode === "recordbook" ? styles.activeButton : ""
                    }`}
                    onClick={handleOpenRecordBook}
                  >
                    E-Service Record Book
                  </button>
                )}
              </div>
              <p className={styles.helperText}>
                {recordBookEnabled
                  ? "Vehicle service history and the e-service record book are view-only."
                  : "Vehicle service history is view-only. The e-service record book will appear here after admin activation."}
              </p>
            </article>
          </section>

          {vehicles.length === 0 && (
            <section className={styles.emptyCard}>
              <h3>No saved vehicles yet</h3>
              <p>
                Add a vehicle through your booking flow first, then your profile will
                show the vehicle history
                {recordBookEnabled ? " and e-service record book" : ""}
                here.
              </p>
              <Link href="/booking/bodywash" className={styles.linkButton}>
                Go to Booking
              </Link>
            </section>
          )}

          {vehicles.length > 0 && viewMode === "history" && (
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2>Vehicle Service History</h2>
                <span>{filteredHistory.length} of {history.length} records</span>
              </div>

              <div className={styles.filterBar}>
                <label className={styles.filterField}>
                  <span>Filter by date</span>
                  <input
                    type="date"
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                  />
                </label>

                <label className={styles.filterField}>
                  <span>Filter by service</span>
                  <select
                    value={historyServiceFilter}
                    onChange={(e) => setHistoryServiceFilter(e.target.value)}
                  >
                    <option value="all">All services</option>
                    {historyServiceOptions.map((serviceName) => (
                      <option key={serviceName} value={serviceName}>
                        {serviceName}
                      </option>
                    ))}
                  </select>
                </label>

                {(historyDateFilter || historyServiceFilter !== "all") && (
                  <button
                    type="button"
                    className={styles.filterReset}
                    onClick={() => {
                      setHistoryDateFilter("");
                      setHistoryServiceFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className={styles.stateText}>No service history found for this vehicle yet.</p>
              ) : filteredHistory.length === 0 ? (
                <p className={styles.stateText}>
                  No service history matches the selected filters.
                </p>
              ) : (
                <div className={styles.timeline}>
                  {filteredHistory.map((booking) => (
                    <article key={booking._id} className={styles.timelineCard}>
                      <div className={styles.timelineTop}>
                        <h3>{booking.serviceType || booking.serviceCategory || "Service"}</h3>
                        <span>{booking.status || "Pending"}</span>
                      </div>
                      <div className={styles.timelineMeta}>
                        <p>Date: {formatDate(booking.bookingDate)}</p>
                        <p>Time: {booking.bookingTime || "-"}</p>
                        <p>Total: {formatMoney(booking.totalPrice)}</p>
                      </div>
                      {booking.notes && <p className={styles.notes}>{booking.notes}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {vehicles.length > 0 && viewMode === "recordbook" && (
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2>E-Service Record Book</h2>
                <span>{formatVehicleNumber(recordBook?.vehicleNumber || selectedVehicle?.vehicleNumber)}</span>
              </div>

              <div className={styles.bookExperience}>
                <div className={styles.bookIntro}>
                  <p className={styles.bookHint}>
                    Tap the booklet to rotate, stand upright, and unfold into three service panels.
                  </p>
                </div>

                <div className={styles.bookStage}>
                    <button
                      type="button"
                      className={`${styles.serviceBook} ${bookOpen ? styles.serviceBookOpen : ""}`}
                      onClick={() => setBookOpen((current) => !current)}
                      aria-label={bookOpen ? "Close record book" : "Open record book"}
                    >
                      <div className={styles.bookShadow}></div>
                      <div className={styles.bookClosedFace}>
                        <div className={styles.bookClosedMain}>
                          <div className={styles.bookNumberBadge}>
                            <span>Book No.</span>
                            <strong>1503</strong>
                          </div>

                          <div className={styles.bookClosedTitle}>SERVICE RECORD</div>

                          <div className={styles.bookLogoCard}>
                            <Image
                              src="/AF_LOGO-removebg-preview.png"
                            alt="AutoFlash logo"
                            width={220}
                            height={88}
                            className={styles.bookLogo}
                          />
                          </div>

                            <div className={styles.bookClosedMetaCard}>
                              <div className={styles.bookClosedMetaRow}>
                                <span>Name</span>
                                <strong>{recordBook?.ownerName || user?.name || "-"}</strong>
                              </div>
                            <div className={styles.bookClosedMetaRow}>
                              <span>Vehicle Number</span>
                              <strong>{formatVehicleNumber(recordBook?.vehicleNumber || selectedVehicle?.vehicleNumber)}</strong>
                            </div>
                              <div className={styles.bookClosedMetaRow}>
                                <span>Mobile No.</span>
                                <strong>{recordBook?.phone || user?.phone || "-"}</strong>
                              </div>
                              <div className={styles.bookClosedMetaRow}>
                                <span>Make / Model</span>
                                <strong>
                                  {[selectedVehicle?.brand, selectedVehicle?.model]
                                    .filter(Boolean)
                                    .join(" / ") || "-"}
                                </strong>
                              </div>
                            </div>

                        <div className={styles.bookClosedFooter}>
                          <span>Tel : 031 22 52 222</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.bookOpenFace}>
                      <div className={styles.bookOpenHeader}>VEHICLE LUBE SERVICE RECORD</div>

                      <div className={styles.bookSheet}>
                        <div className={styles.sheetTopScroll}>
                          <table className={styles.serviceTable}>
                            <thead>
                              <tr>
                                <th rowSpan={2} className={styles.dateCol}>Date</th>
                                <th colSpan={OTHER_SERVICE_ITEMS.length} className={styles.bgGreen}>Other Service</th>
                                <th colSpan={FILTER_ITEMS.length} className={styles.bgRed}>Filters Replacement</th>
                                <th colSpan={HEALTH_CHECK_ITEMS.length} className={styles.bgBlue}>Health Check</th>
                                <th colSpan={OIL_FLUID_ITEMS.length} className={styles.bgPink}>Oil / Fluids</th>
                                <th colSpan={EXTRA_ITEMS.length} className={styles.bgGrey}>Misc</th>
                                <th rowSpan={2} className={styles.metaCol}>Present ODO Meter KM</th>
                                <th rowSpan={2} className={styles.metaCol}>Next Service KM</th>
                                <th rowSpan={2} className={styles.metaCol}>Next Oil Change Date</th>
                                <th rowSpan={2} className={styles.metaCol}>Service Advisor Signature</th>
                              </tr>
                              <tr className={styles.verticalHeaders}>
                                {ALL_RECORD_ITEMS.map((item, index) => (
                                  <th key={`${item}-${index}`}>
                                    <div>{item}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: GRID_ROW_COUNT }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                  {(() => {
                                    const rowEntry = orderedRecordEntries[rowIndex];

                                    return (
                                      <>
                                  <td className={styles.dateCell}>
                                        {formatDate(rowEntry?.serviceDate || rowEntry?.date)}
                                  </td>
                                  {ALL_RECORD_ITEMS.map((item, columnIndex) => (
                                    <td
                                      key={`${item}-${rowIndex}-${columnIndex}`}
                                      className={`${styles.checkCell} ${
                                        columnIndex < OTHER_SERVICE_ITEMS.length
                                          ? styles.shadeGreen
                                          : columnIndex < OTHER_SERVICE_ITEMS.length + FILTER_ITEMS.length
                                          ? ""
                                          : columnIndex <
                                            OTHER_SERVICE_ITEMS.length + FILTER_ITEMS.length + HEALTH_CHECK_ITEMS.length
                                          ? styles.shadeBlue
                                          : columnIndex <
                                            OTHER_SERVICE_ITEMS.length +
                                              FILTER_ITEMS.length +
                                              HEALTH_CHECK_ITEMS.length +
                                              OIL_FLUID_ITEMS.length
                                          ? styles.shadePink
                                          : styles.shadeGrey
                                      }`}
                                    >
                                          {getServiceStatus(rowEntry, item)}
                                    </td>
                                  ))}
                                      <td className={styles.metaCell}>{rowEntry?.odometer ?? ""}</td>
                                      <td className={styles.metaCell}>{rowEntry?.nextServiceKM ?? ""}</td>
                                      <td className={styles.metaCell}>{formatDate(rowEntry?.nextServiceDate)}</td>
                                      <td className={styles.metaCell}>{rowEntry?.technician || ""}</td>
                                      </>
                                    );
                                  })()}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className={styles.sheetBottom}>
                          <div className={styles.importantSection}>
                            <div className={styles.importantLabel}>Important !</div>
                              <div className={styles.importantGrid}>
                                {([
                                {
                                  label: "Engine Oil",
                                  key: "engineOil" as ImportantSectionKey,
                                  fields: [
                                    { label: "Make", valueKey: "make" },
                                    { label: "Type", valueKey: "type" },
                                  ],
                                },
                                {
                                  label: "Transmission Oil",
                                  key: "transOil" as ImportantSectionKey,
                                  fields: [
                                    { label: "Auto/Manual", valueKey: "make" },
                                    { label: "Type", valueKey: "type" },
                                  ],
                                },
                                {
                                  label: "Differential Oil",
                                  key: "diffOil" as ImportantSectionKey,
                                  fields: [{ label: "Make", valueKey: "make" }],
                                },
                                {
                                  label: "Transfer Case Oil",
                                  key: "transferOil" as ImportantSectionKey,
                                  fields: [{ label: "Type", valueKey: "type" }],
                                },
                                {
                                  label: "Power Steering",
                                  key: "pSteering" as ImportantSectionKey,
                                  fields: [
                                    { label: "Make", valueKey: "make" },
                                    { label: "Type", valueKey: "type" },
                                  ],
                                },
                                {
                                  label: "Brake Fluid",
                                  key: "brakeFluid" as ImportantSectionKey,
                                  fields: [
                                    { label: "Make", valueKey: "make" },
                                    { label: "Type", valueKey: "type" },
                                  ],
                                },
                              ]).map((group) => (
                                <div key={group.label} className={styles.importantRow}>
                                  <span className={styles.rowLabel}>{group.label}</span>
                                  <div className={styles.rowInputs}>
                                    {group.fields.map((field) => (
                                      <div key={field.label} className={styles.inputBox}>
                                        <span>{field.label}</span>
                                        <strong>{getImportantValue(latestRecordEntry, group.key, field.valueKey)}</strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={styles.sheetLedger}>
                            <div className={styles.sheetLedgerHeader}>
                              <div className={styles.notesDateCol}>Date</div>
                              <div className={styles.notesTextCol}>Notes</div>
                            </div>
                            <div className={styles.sheetLedgerBody}>
                              {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className={styles.sheetLedgerRow}>
                                  <span className={styles.lineNum}>{String(index + 1).padStart(2, "0")}</span>
                                  <strong className={styles.lineContent}>{orderedRecordEntries[index]?.notes || ""}</strong>
                                </div>
                              ))}
                              <div className={styles.watermark}>NOTES</div>
                            </div>
                            <div className={styles.denoteFooter}>
                              DENOTE : R - Replace, T - Topup, C - Clean
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {viewerOpen && hasProfileImage && (
        <div
          className={styles.viewerOverlay}
          onClick={() => setViewerOpen(false)}
        >
          <div
            className={styles.viewerCard}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.viewerHeader}>
              <h3>Profile Picture</h3>
              <button
                type="button"
                className={styles.viewerClose}
                onClick={() => setViewerOpen(false)}
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formProfileImage}
              alt={formName || "Profile picture"}
              className={styles.viewerImage}
            />
          </div>
        </div>
      )}
    </main>
  );
}
