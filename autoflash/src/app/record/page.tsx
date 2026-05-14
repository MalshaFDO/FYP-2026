"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, PointerEvent, WheelEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBookOpen, FaHistory } from "react-icons/fa";
import { getVehicleModelsByMake, vehicleMakes } from "@/lib/vehicleCatalog";
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

type CropSettings = {
  zoom: number;
  x: number;
  y: number;
  frameSize: number;
};

type CropPoint = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getPointDistance = (first: CropPoint, second: CropPoint) =>
  Math.hypot(first.x - second.x, first.y - second.y);

const getPointCenter = (first: CropPoint, second: CropPoint) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read selected image"));
    reader.readAsDataURL(file);
  });

const getImageAspect = (imageSrc: string) =>
  new Promise<number>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image.naturalWidth / image.naturalHeight || 1);
    image.onerror = () => reject(new Error("Failed to load selected image"));
    image.src = imageSrc;
  });

const cropImageToSquareDataUrl = (
  imageSrc: string,
  crop: CropSettings,
  size = 512
) =>
  new Promise<string>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => {
      const frameSize = crop.frameSize || size;
      const aspect = image.naturalWidth / image.naturalHeight;
      const baseScale =
        aspect >= 1
          ? (frameSize / image.naturalHeight) * crop.zoom
          : (frameSize / image.naturalWidth) * crop.zoom;
      const displayWidth = image.naturalWidth * baseScale;
      const displayHeight = image.naturalHeight * baseScale;
      const maxX = Math.max(0, (displayWidth - frameSize) / 2);
      const maxY = Math.max(0, (displayHeight - frameSize) / 2);
      const clampedX = clamp(crop.x, -maxX, maxX);
      const clampedY = clamp(crop.y, -maxY, maxY);
      const sourceSize = frameSize / baseScale;
      const sourceX = clamp(
        (displayWidth - frameSize) / 2 / baseScale - clampedX / baseScale,
        0,
        image.naturalWidth - sourceSize
      );
      const sourceY = clamp(
        (displayHeight - frameSize) / 2 / baseScale - clampedY / baseScale,
        0,
        image.naturalHeight - sourceSize
      );
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to crop image"));
        return;
      }

      canvas.width = size;
      canvas.height = size;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        size,
        size
      );

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };

    image.onerror = () => {
      reject(new Error("Failed to load selected image"));
    };

    image.src = imageSrc;
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

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const profileSkeletonRows = Array.from({ length: 5 }, (_, index) => index);
const actionSkeletonRows = Array.from({ length: 2 }, (_, index) => index);

function ProfileSkeleton() {
  return (
    <section className={`${styles.profileGrid} ${styles.profileSkeletonGrid}`}>
      <article className={`${styles.profileCard} ${styles.profileSkeletonCard}`}>
        <div className={styles.profileSkeletonHeader}>
          <span />
          <strong />
        </div>
        <div className={styles.profileSkeletonDetails}>
          {profileSkeletonRows.map((row) => (
            <div className={styles.profileSkeletonField} key={row}>
              <span />
              <strong />
            </div>
          ))}
        </div>
        <div className={styles.profileSkeletonActions}>
          <span />
          <span />
        </div>
      </article>

      <article className={`${styles.profileCard} ${styles.quickActionsCard} ${styles.profileSkeletonCard}`}>
        <div className={styles.profileSkeletonTitle} />
        <div className={styles.profileSkeletonButtons}>
          {actionSkeletonRows.map((row) => (
            <span key={row} />
          ))}
        </div>
        <div className={styles.profileSkeletonText} />
      </article>
    </section>
  );
}

export default function RecordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
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
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(false);
  const [sendingDeleteOtp, setSendingDeleteOtp] = useState(false);
  const [newVehicleType, setNewVehicleType] = useState("sedan");
  const [newVehicleNumber, setNewVehicleNumber] = useState("");
  const [newVehicleBrand, setNewVehicleBrand] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [deleteVehicleOpen, setDeleteVehicleOpen] = useState(false);
  const [deleteVehicleOtp, setDeleteVehicleOtp] = useState("");
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingProfileImage, setPendingProfileImage] = useState("");
  const [pendingImageAspect, setPendingImageAspect] = useState(1);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [sendingCurrentPhoneOtp, setSendingCurrentPhoneOtp] = useState(false);
  const [currentPhoneOtpSent, setCurrentPhoneOtpSent] = useState(false);
  const [currentPhoneOtp, setCurrentPhoneOtp] = useState("");
  const [currentPhoneVerified, setCurrentPhoneVerified] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const historySectionRef = useRef<HTMLElement | null>(null);
  const recordBookSectionRef = useRef<HTMLElement | null>(null);
  const cropPointersRef = useRef<Map<number, CropPoint>>(new Map());
  const lastCropDragPointRef = useRef<CropPoint | null>(null);
  const lastCropPinchDistanceRef = useRef<number | null>(null);
  const lastCropPinchCenterRef = useRef<CropPoint | null>(null);
  const newVehicleModelOptions = useMemo(
    () => getVehicleModelsByMake(newVehicleBrand),
    [newVehicleBrand]
  );
  const getCropBounds = (zoom = cropZoom) => {
    const frameSize = cropFrameRef.current?.clientWidth || 320;
    const displayWidth =
      pendingImageAspect >= 1 ? frameSize * pendingImageAspect * zoom : frameSize * zoom;
    const displayHeight =
      pendingImageAspect >= 1 ? frameSize * zoom : (frameSize / pendingImageAspect) * zoom;

    return {
      x: Math.max(0, (displayWidth - frameSize) / 2),
      y: Math.max(0, (displayHeight - frameSize) / 2),
    };
  };

  useEffect(() => {
    const storedToken =
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("accessToken");

    if (!storedToken) {
      window.localStorage.setItem("redirectAfterLogin", "/record");
      router.replace("/login");
      setToken(null);
      return;
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const res = await fetch("/api/feature-settings/e-record-book", {
          cache: "no-store",
        });

        if (res.status === 404) {
          setRecordBookEnabled(false);
          return;
        }

        const data = await parseJsonResponse(res);

        if (!res.ok || !data?.success) {
          throw new Error(data.message || "Failed to load e-record book status");
        }

        setRecordBookEnabled(Boolean(data.enabled));
      } catch (err: unknown) {
        console.error("RECORD PAGE FEATURE STATUS ERROR:", err);
        setRecordBookEnabled(false);
      }
    };

    fetchFeatureStatus();
  }, []);

  useEffect(() => {
    if (token === undefined) {
      return;
    }

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
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load profile"));
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
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load vehicle details"));
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!token) return;

    try {
      setSavingVehicle(true);
      setError("");
      setSaveMessage("");

      const res = await fetch("/api/vehicles/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleNumber: newVehicleNumber,
          vehicleType: newVehicleType,
          brand: newVehicleBrand,
          model: newVehicleModel,
          fuelType: "",
          currentOil: "",
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to add vehicle");
      }

      const addedVehicle = data.vehicle as Vehicle;

      setVehicles((current) => [addedVehicle, ...current]);
      setSelectedVehicleId(addedVehicle._id);
      setNewVehicleNumber("");
      setNewVehicleBrand("");
      setNewVehicleModel("");
      setNewVehicleType("sedan");
      setAddVehicleOpen(false);
      setViewMode("history");
      setSaveMessage(
        `${formatVehicleNumber(addedVehicle.vehicleNumber)} - ${addedVehicle.brand} ${addedVehicle.model} added to this profile.`
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add vehicle"));
    } finally {
      setSavingVehicle(false);
    }
  };

  const closeAddVehicleModal = () => {
    if (savingVehicle) return;

    setAddVehicleOpen(false);
  };

  const closeDeleteVehicleModal = () => {
    if (deletingVehicle || sendingDeleteOtp) return;

    setDeleteVehicleOpen(false);
    setDeleteVehicleOtp("");
    setDeleteOtpSent(false);
  };

  const sendDeleteVehicleOtp = async () => {
    if (!user?.phone) {
      setError("Registered mobile number is not available.");
      return;
    }

    try {
      setSendingDeleteOtp(true);
      setError("");
      setSaveMessage("");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: user.phone, purpose: "delete_vehicle" }),
      });

      const data = await parseJsonResponse(res);

      if (data?.isNewUser) {
        throw new Error("This mobile number is not registered. Please sign up first.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setDeleteOtpSent(true);
      setSaveMessage(`OTP sent to registered mobile number ${user.phone}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setSendingDeleteOtp(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!token || !selectedVehicle) return;

    try {
      setDeletingVehicle(true);
      setError("");
      setSaveMessage("");

      const res = await fetch("/api/vehicles/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          otp: deleteVehicleOtp,
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete vehicle");
      }

      const nextVehicles = vehicles.filter((vehicle) => vehicle._id !== selectedVehicle._id);
      const nextSelectedVehicle = nextVehicles[0] ?? null;

      setVehicles(nextVehicles);
      setSelectedVehicleId(nextSelectedVehicle?._id || "");
      setHistory([]);
      setRecordBook(null);
      setViewMode("history");
      setDeleteVehicleOpen(false);
      setDeleteVehicleOtp("");
      setDeleteOtpSent(false);
      setSaveMessage(
        `${formatVehicleNumber(selectedVehicle.vehicleNumber)} - ${selectedVehicle.brand} ${selectedVehicle.model} deleted.`
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete vehicle"));
    } finally {
      setDeletingVehicle(false);
    }
  };

  const closeCropper = () => {
    setCropperOpen(false);
    setPendingProfileImage("");
    setPendingImageAspect(1);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
    cropPointersRef.current.clear();
    lastCropDragPointRef.current = null;
    lastCropPinchDistanceRef.current = null;
    lastCropPinchCenterRef.current = null;
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
      const aspect = await getImageAspect(dataUrl);
      setPendingProfileImage(dataUrl);
      setPendingImageAspect(aspect);
      setCropZoom(1);
      setCropX(0);
      setCropY(0);
      setCropperOpen(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load selected image"));
    }
  };

  const applyCroppedImage = async () => {
    if (!pendingProfileImage) return;

    try {
      setError("");
      const dataUrl = await cropImageToSquareDataUrl(pendingProfileImage, {
        zoom: cropZoom,
        x: cropX,
        y: cropY,
        frameSize: cropFrameRef.current?.clientWidth || 320,
      });

      setFormProfileImage(dataUrl);
      setSaveMessage("Picture adjusted. Click Save Profile to update it.");
      closeCropper();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to crop selected image"));
    }
  };

  const resetCropGesture = () => {
    lastCropDragPointRef.current = null;
    lastCropPinchDistanceRef.current = null;
    lastCropPinchCenterRef.current = null;
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    cropPointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (cropPointersRef.current.size === 1) {
      lastCropDragPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      lastCropPinchDistanceRef.current = null;
      lastCropPinchCenterRef.current = null;
    }
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointers = cropPointersRef.current;

    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointers.values());

    if (points.length === 1) {
      const lastPoint = lastCropDragPointRef.current;
      const nextPoint = points[0];

      if (lastPoint) {
        const bounds = getCropBounds();
        setCropX((current) => clamp(current + (nextPoint.x - lastPoint.x), -bounds.x, bounds.x));
        setCropY((current) => clamp(current + (nextPoint.y - lastPoint.y), -bounds.y, bounds.y));
      }

      lastCropDragPointRef.current = nextPoint;
      lastCropPinchDistanceRef.current = null;
      lastCropPinchCenterRef.current = null;
      return;
    }

    const [firstPoint, secondPoint] = points;
    const nextDistance = getPointDistance(firstPoint, secondPoint);
    const nextCenter = getPointCenter(firstPoint, secondPoint);

    if (lastCropPinchDistanceRef.current) {
      const zoomRatio = nextDistance / lastCropPinchDistanceRef.current;
      setCropZoom((current) => {
        const nextZoom = clamp(current * zoomRatio, 1, 4);
        const bounds = getCropBounds(nextZoom);
        setCropX((currentX) => clamp(currentX, -bounds.x, bounds.x));
        setCropY((currentY) => clamp(currentY, -bounds.y, bounds.y));
        return nextZoom;
      });
    }

    if (lastCropPinchCenterRef.current) {
      const bounds = getCropBounds();
      setCropX((current) =>
        clamp(current + (nextCenter.x - lastCropPinchCenterRef.current!.x), -bounds.x, bounds.x)
      );
      setCropY((current) =>
        clamp(current + (nextCenter.y - lastCropPinchCenterRef.current!.y), -bounds.y, bounds.y)
      );
    }

    lastCropPinchDistanceRef.current = nextDistance;
    lastCropPinchCenterRef.current = nextCenter;
    lastCropDragPointRef.current = null;
  };

  const handleCropPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    cropPointersRef.current.delete(event.pointerId);

    if (cropPointersRef.current.size === 1) {
      const [remainingPoint] = Array.from(cropPointersRef.current.values());
      lastCropDragPointRef.current = remainingPoint;
      lastCropPinchDistanceRef.current = null;
      lastCropPinchCenterRef.current = null;
      return;
    }

    if (cropPointersRef.current.size === 0) {
      resetCropGesture();
    }
  };

  const handleCropWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextZoomDelta = event.deltaY < 0 ? 0.08 : -0.08;
    setCropZoom((current) => {
      const nextZoom = clamp(current + nextZoomDelta, 1, 4);
      const bounds = getCropBounds(nextZoom);
      setCropX((currentX) => clamp(currentX, -bounds.x, bounds.x));
      setCropY((currentY) => clamp(currentY, -bounds.y, bounds.y));
      return nextZoom;
    });
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

      if (data?.isNewUser) {
        throw new Error("This mobile number is not registered. Please sign up first.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setCurrentPhoneOtpSent(true);
      setSaveMessage("OTP sent to your current mobile number.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send OTP"));
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
    window.setTimeout(() => {
      recordBookSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleOpenHistory = () => {
    setViewMode("history");
    window.setTimeout(() => {
      historySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  if (token === undefined) {
    return (
      <main className={styles.page}>
        <ProfileSkeleton />
      </main>
    );
  }

  if (token === null) {
    return null;
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

      {loading && <ProfileSkeleton />}
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
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setAddVehicleOpen(true);
                    setError("");
                    setSaveMessage("");
                  }}
                >
                  Add New Vehicle
                </button>
                {selectedVehicle && (
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => {
                      setDeleteVehicleOpen(true);
                      setDeleteVehicleOtp("");
                      setDeleteOtpSent(false);
                      setError("");
                      setSaveMessage("");
                    }}
                  >
                    Delete Vehicle
                  </button>
                )}
              </div>

              <p className={styles.profileHelper}>
                Use edit mode to update your profile. To change the mobile number,
                first verify your current number with an OTP, then enter the new
                number.
              </p>
            </article>

            <article className={`${styles.profileCard} ${styles.quickActionsCard}`}>
              <div className={styles.quickActionsHeader}>
                <span className={styles.quickActionsBadge}>Tools</span>
                <h2>Quick Actions</h2>
              </div>
              <div className={styles.buttonColumn}>
                <button
                  className={`${styles.actionButton} ${
                    viewMode === "history" ? styles.activeButton : ""
                  }`}
                  onClick={handleOpenHistory}
                >
                  <FaHistory />
                  <span>Service History</span>
                </button>
                {recordBookEnabled && (
                  <button
                    className={`${styles.actionButton} ${
                      viewMode === "recordbook" ? styles.activeButton : ""
                    }`}
                    onClick={handleOpenRecordBook}
                  >
                    <FaBookOpen />
                    <span>E-Service Record Book</span>
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
                Add a vehicle here first, then your profile will show the vehicle history
                {recordBookEnabled ? " and e-service record book" : ""}
                here.
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setAddVehicleOpen(true)}
              >
                Add New Vehicle
              </button>
            </section>
          )}

          {vehicles.length > 0 && viewMode === "history" && (
            <section ref={historySectionRef} className={styles.sectionCard}>
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

          {addVehicleOpen && (
            <div
              className={styles.modalOverlay}
              role="presentation"
              onClick={closeAddVehicleModal}
            >
              <section
                className={styles.vehicleModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-vehicle-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 id="add-vehicle-title">Add Vehicle</h2>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={closeAddVehicleModal}
                    disabled={savingVehicle}
                    aria-label="Close add vehicle"
                  >
                    X
                  </button>
                </div>

                <p className={styles.vehicleNotice}>
                  <strong>Important:</strong> This vehicle will be saved under{" "}
                  <strong>{user?.name || "your profile"}</strong> and mobile number{" "}
                  <strong>{user?.phone || "-"}</strong>.
                </p>

                <div className={styles.vehicleFormGrid}>
                  <label className={styles.vehicleField}>
                    <span>Vehicle type</span>
                    <select
                      value={newVehicleType}
                      onChange={(e) => setNewVehicleType(e.target.value)}
                      disabled={savingVehicle}
                    >
                      <option value="sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Pickup">Pick-Up</option>
                      <option value="Minivan">Minivan</option>
                    </select>
                  </label>

                  <label className={styles.vehicleField}>
                    <span>Vehicle number</span>
                    <input
                      value={newVehicleNumber}
                      onChange={(e) => setNewVehicleNumber(e.target.value)}
                      placeholder="CAA - 1234"
                      disabled={savingVehicle}
                    />
                  </label>

                  <label className={styles.vehicleField}>
                    <span>Vehicle make</span>
                    <input
                      list="profile-vehicle-makes"
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                      placeholder="Type or select make"
                      disabled={savingVehicle}
                    />
                    <datalist id="profile-vehicle-makes">
                      {vehicleMakes.map((make) => (
                        <option key={make} value={make} />
                      ))}
                    </datalist>
                  </label>

                  <label className={styles.vehicleField}>
                    <span>Vehicle model</span>
                    <input
                      list="profile-vehicle-models"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      placeholder="Type or select model"
                      disabled={savingVehicle}
                    />
                    <datalist id="profile-vehicle-models">
                      {newVehicleModelOptions.map((model) => (
                        <option key={model} value={model} />
                      ))}
                    </datalist>
                  </label>
                </div>

                <div className={styles.profileFooter}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleAddVehicle}
                    disabled={savingVehicle}
                  >
                    {savingVehicle ? "Adding..." : "Add Vehicle"}
                  </button>
                </div>
              </section>
            </div>
          )}

          {deleteVehicleOpen && selectedVehicle && (
            <div
              className={styles.modalOverlay}
              role="presentation"
              onClick={closeDeleteVehicleModal}
            >
              <section
                className={styles.vehicleModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-vehicle-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 id="delete-vehicle-title">Delete Vehicle</h2>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={closeDeleteVehicleModal}
                    disabled={deletingVehicle || sendingDeleteOtp}
                    aria-label="Close delete vehicle"
                  >
                    X
                  </button>
                </div>

                <p className={styles.deleteNotice}>
                  <strong>{formatVehicleNumber(selectedVehicle.vehicleNumber)} - {selectedVehicle.brand} {selectedVehicle.model}</strong>
                  <span>
                    To delete this vehicle, send an OTP to registered mobile number{" "}
                    <strong>{user?.phone || "-"}</strong> and enter it below.
                  </span>
                </p>

                <div className={styles.deleteOtpBlock}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={sendDeleteVehicleOtp}
                    disabled={sendingDeleteOtp || deletingVehicle}
                  >
                    {sendingDeleteOtp ? "Sending OTP..." : deleteOtpSent ? "Resend OTP" : "Send OTP"}
                  </button>

                  <label className={styles.vehicleField}>
                    <span>OTP Code</span>
                    <input
                      value={deleteVehicleOtp}
                      onChange={(event) => setDeleteVehicleOtp(event.target.value)}
                      placeholder={deleteOtpSent ? "Enter OTP" : "Send OTP first"}
                      disabled={!deleteOtpSent || deletingVehicle}
                    />
                  </label>
                </div>

                <div className={styles.profileFooter}>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={handleDeleteVehicle}
                    disabled={!deleteOtpSent || !deleteVehicleOtp.trim() || deletingVehicle}
                  >
                    {deletingVehicle ? "Deleting..." : "Delete Vehicle"}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={closeDeleteVehicleModal}
                    disabled={deletingVehicle || sendingDeleteOtp}
                  >
                    Cancel
                  </button>
                </div>
              </section>
            </div>
          )}

          {vehicles.length > 0 && viewMode === "recordbook" && (
            <section ref={recordBookSectionRef} className={styles.sectionCard}>
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

      {cropperOpen && pendingProfileImage && (
        <div className={styles.viewerOverlay} onClick={closeCropper}>
          <div
            className={styles.cropperCard}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.viewerHeader}>
              <h3>Adjust Profile Picture</h3>
              <button
                type="button"
                className={styles.viewerClose}
                onClick={closeCropper}
              >
                Cancel
              </button>
            </div>

            <div
              ref={cropFrameRef}
              className={styles.cropFrame}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerEnd}
              onPointerCancel={handleCropPointerEnd}
              onPointerLeave={handleCropPointerEnd}
              onWheel={handleCropWheel}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingProfileImage}
                alt="Crop preview"
                className={styles.cropImage}
                style={{
                  width:
                    pendingImageAspect >= 1
                      ? `${pendingImageAspect * cropZoom * 100}%`
                      : `${cropZoom * 100}%`,
                  height:
                    pendingImageAspect >= 1
                      ? `${cropZoom * 100}%`
                      : `${(cropZoom / pendingImageAspect) * 100}%`,
                  transform: `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px))`,
                }}
              />
            </div>

            <p className={styles.cropHint}>
              Drag to move. Pinch with two fingers to zoom in or out.
            </p>

            <div className={styles.cropActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setCropZoom(1);
                  setCropX(0);
                  setCropY(0);
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={applyCroppedImage}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
