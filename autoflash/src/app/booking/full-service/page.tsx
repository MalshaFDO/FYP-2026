'use client';

import { useEffect, useState } from "react";
import type { TouchEvent } from "react";
import { Oswald, Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaPlus, FaOilCan, FaTools, FaRobot } from 'react-icons/fa';
import styles from "./FullService.module.css";
import { calculateServiceQuote } from "@/lib/pricing";

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

type VehicleType = 'Sedan' | 'SUV' | 'Pickup' | 'MiniVan';
type PricingVehicleType = "sedan" | "suv" | "pickup" | "minivan";

interface SlotBooking {
  bookingDate: string;
  bookingTime: string;
  status?: string;
  serviceCategory?: "bodywash" | "fullservice";
}

interface BookingData {
  vehicle: string;
  serviceType?: string;
  vehicleType?: PricingVehicleType;
  services?: string[];
  additionalServices?: Array<{ id: number; name: string; price: number }>;
  oilGrade: string;
  oilBrand?: string;
  mileage: number | null;
  bookingDate: string;
  bookingTime: string;
  customerName?: string;
  mobile?: string;
  email?: string;
  vehicleNumber?: string;
  vehicleId?: string;
  hasSavedVehicles?: boolean;
  useSavedVehicle?: boolean;
  selectedVehicleLabel?: string;
  quotationNumber?: string;
  quote?: {
    items: Array<{ name: string; price: number }>;
    total: number;
  };
}

interface SavedVehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: VehicleType | Lowercase<VehicleType>;
  brand: string;
  model: string;
}

interface ProfileUser {
  name?: string;
  phone?: string;
  email?: string;
}

type ServiceOption = {
  key: string;
  label: string;
  locked?: boolean;
  free?: boolean;
};

type ExtraServiceOption = {
  id: number;
  name: string;
  price?: number;
  priceByVehicle?: Record<VehicleType, number>;
};

const carImages: Record<VehicleType, string> = {
  Sedan: "/01.png",
  SUV: "/02.png",
  Pickup: "/03.png",
  MiniVan: "/04.png",
};

const pricingVehicleTypeMap: Record<VehicleType, PricingVehicleType> = {
  Sedan: "sedan",
  SUV: "suv",
  Pickup: "pickup",
  MiniVan: "minivan",
};

const vehicleTypes: VehicleType[] = ["Sedan", "SUV", "Pickup", "MiniVan"];

const savedVehicleTypeMap: Record<string, VehicleType> = {
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Pickup",
  minivan: "MiniVan",
};

const fullServiceList: ServiceOption[] = [
  { key: "fullService", label: "Full Service", locked: true },
  { key: "engineWash", label: "Engine Wash" },
  { key: "oilChange", label: "Oil Change", locked: true },
  { key: "oilFilter", label: "Oil Filter", locked: true },

  { key: "brakeService", label: "Brake Service", locked: true },
  { key: "caliperGrease", label: "Caliper Grease", locked: true },
  { key: "brakeCaliperLube", label: "Brake Caliper Lube", locked: true },
  { key: "brakeDrumCleaning", label: "Brake Drum Cleaning", locked: true },
  { key: "sumpWasher", label: "Sump Washer", locked: true },
  { key: "chemicalCost", label: "Chemical Cost", locked: true },

  { key: "underBodyWash", label: "Under Body Wash" },
  { key: "windowWasher", label: "Window Washer Fluid" },
  { key: "rexine", label: "Rexine" },
  { key: "interiorFumigation", label: "Interior Fumigation" },
  { key: "n2", label: "Nitrogen (N2)" },

  { key: "scanReport", label: "Scan Report (FREE)", locked: true, free: true },
] as const;

const oilChangeList: ServiceOption[] = [
  { key: "oilChange", label: "Oil Change", locked: true },
  { key: "oilFilter", label: "Oil Filter", locked: true },
  { key: "oilChangeLabor", label: "Oil Change Labor Charge", locked: true },
];

const fullServicePackageKeys = fullServiceList.map((service) => service.key);
const oilChangePackageKeys = oilChangeList.map((service) => service.key);

const getWeekDays = (offset: number) => {
  const days = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + offset * 7);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    days.push({
      date: d.getDate().toString().padStart(2, '0'),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      isSunday: d.getDay() === 0,
      fullDate: d.toDateString(),
      isoDate: d.toISOString().split("T")[0],
    });
  }

  return days;
};

const timeSlots = [
  '08:00 am',
  '09:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '01:00 pm',
  '02:00 pm',
  '03:00 pm',
  '04:00 pm',
  '05:00 pm',
];

const getFirstOpenDayIso = (offset: number) => {
  const firstOpenDay = getWeekDays(offset).find((day) => !day.isSunday);
  return firstOpenDay?.isoDate || new Date().toISOString().split("T")[0];
};

const getFirstAvailableDayIso = (
  offset: number,
  closedDays: { date: string; reason?: string }[]
) => {
    const firstAvailableDay = getWeekDays(offset).find(
    (day) =>
      !day.isSunday &&
      !closedDays.some(
        (closedDay: { date: string; reason?: string }) => closedDay.date === day.isoDate
      )
  );

  return firstAvailableDay?.isoDate || getWeekDays(offset)[0]?.isoDate || new Date().toISOString().split("T")[0];
};

function toTitleCase(value?: string) {
  return String(value ?? "Mobil")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const standardAddons: ExtraServiceOption[] = [
  { id: 1, name: "Wheel Alignment", price: 3500 },
  { id: 2, name: "Brake Fluid", price: 1800 },
  { id: 3, name: "Coolant Flush", price: 2500 },
  { id: 4, name: "Battery Health", price: 750 },
  { id: 5, name: "Tire Rotation", price: 1500 },
  {
    id: 6,
    name: "Engine Wash",
    priceByVehicle: { Sedan: 1750, SUV: 1950, Pickup: 2450, MiniVan: 1950 },
  },
];

const oilSpecificAddons: ExtraServiceOption[] = [
  {
    id: 101,
    name: "Quick Wash",
    priceByVehicle: { Sedan: 900, SUV: 1100, Pickup: 1250, MiniVan: 1550 },
  },
  {
    id: 102,
    name: "Bodywash & Vacuum",
    priceByVehicle: { Sedan: 1450, SUV: 1750, Pickup: 2000, MiniVan: 2400 },
  },
  {
    id: 103,
    name: "Wash, Vacuum & WAX",
    priceByVehicle: { Sedan: 1950, SUV: 2250, Pickup: 2450, MiniVan: 2800 },
  },
  {
    id: 104,
    name: "Full Bodywash",
    priceByVehicle: { Sedan: 3600, SUV: 4100, Pickup: 4600, MiniVan: 4850 },
  },
];

const extraServiceOptions = [...standardAddons, ...oilSpecificAddons];

function getExtraServicePrice(extra: ExtraServiceOption, vehicle: VehicleType) {
  if (extra.priceByVehicle) {
    return extra.priceByVehicle[vehicle];
  }

  return extra.price ?? 0;
}

export default function FullServicePage() {
  const FULLSERVICE_SLOTS = 2;
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<SavedVehicle | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("full"); 
  const [extras, setExtras] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(getFirstOpenDayIso(0));
  const [selectedTime, setSelectedTime] = useState('02:00 pm');
  const [slotBookings, setSlotBookings] = useState<SlotBooking[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [closedSlots, setClosedSlots] = useState<
    { date: string; startTime: string; endTime: string; reason?: string }[]
  >([]);
  const [closedDays, setClosedDays] = useState<
    { date: string; reason?: string }[]
  >([]);
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token") ||
        window.localStorage.getItem("authToken") ||
        window.localStorage.getItem("accessToken")
      : null;

  const updateWeekOffset = (offset: number) => {
    setWeekOffset(offset);
    setSelectedDate(getFirstAvailableDayIso(offset, closedDays));
  };

  const toggleExtra = (id: number) => {
    setExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [cloudinaryPdfUrl, setCloudinaryPdfUrl] = useState<string | null>(null);
  const [quotationNumber, setQuotationNumber] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState(
    fullServicePackageKeys
  );
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [hasPromptedQuotationConfirmation, setHasPromptedQuotationConfirmation] =
    useState(false);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<
    | "start"
    | "saved_vehicle_choice"
    | "make_model"
    | "oil_info"
    | "oil_brand"
    | "select_services"
    | "generate_quote"
    | "generate_pdf"
    | "quotation"
    | "confirm_slot"
    | "details_name"
    | "details_mobile"
    | "details_vehicle"
    | "done"
  >("start");

  const [bookingData, setBookingData] = useState<BookingData>({
    vehicle: "",
    oilGrade: "",
    mileage: null,
    bookingDate: selectedDate,
    bookingTime: selectedTime,
  });

  const selectedAdditionalServices = extras
    .map((id) => extraServiceOptions.find((service) => service.id === id))
    .filter((service): service is ExtraServiceOption => Boolean(service))
    .map((service) => ({
      id: service.id,
      name: service.name,
      price: getExtraServicePrice(service, vehicle),
    }));

  const hasSelectedAdditionalServices = selectedAdditionalServices.length > 0;
  const activeServiceList =
    selectedPlan === "oil" ? oilChangeList : fullServiceList;

  const oilQuotePreview =
    bookingData.oilGrade && bookingData.vehicle
      ? calculateServiceQuote({
          oilGrade: bookingData.oilGrade,
          vehicle: bookingData.vehicle,
          brand: (bookingData.oilBrand as "toyota" | "mobil" | "castrol" | "honda") || "mobil",
        })
      : null;

  const getServiceLabel = (service: ServiceOption) => {
    if (service.key === "oilChange" && oilQuotePreview && bookingData.oilGrade) {
      return `Engine Oil (${toTitleCase(bookingData.oilBrand)} ${bookingData.oilGrade}, ${oilQuotePreview.liters}L)`;
    }

    if (service.key === "oilFilter") {
      return "Genuine Oil Filter Replacement";
    }

    if (service.key === "oilChangeLabor") {
      return "Oil Change Labor Charge";
    }

    return service.label;
  };

  useEffect(() => {
    setSelectedServices(
      selectedPlan === "oil" ? oilChangePackageKeys : fullServicePackageKeys
    );
  }, [selectedPlan]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.bookings)) {
          setSlotBookings(data.bookings);
        }
      } catch (error) {
        console.error("Fetch slot bookings error:", error);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;

        const res = await fetch("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          return;
        }

        const nextUser: ProfileUser | null = data.user ?? null;
        const nextVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
        const defaultVehicle = nextVehicles[0] ?? null;

        setVehicles(nextVehicles);
        setSelectedVehicleId(defaultVehicle?._id || "");
        setSelectedVehicle(defaultVehicle);
        setBookingData((current) => ({
          ...current,
          customerName: nextUser?.name || current.customerName,
          mobile: nextUser?.phone || current.mobile,
          email: nextUser?.email || current.email,
          hasSavedVehicles: nextVehicles.length > 0,
          vehicle: defaultVehicle
            ? `${defaultVehicle.brand} ${defaultVehicle.model}`.trim()
            : current.vehicle,
          vehicleNumber: defaultVehicle?.vehicleNumber || current.vehicleNumber,
          vehicleId: defaultVehicle?._id || current.vehicleId,
          selectedVehicleLabel: defaultVehicle
            ? `${defaultVehicle.brand} ${defaultVehicle.model} (${defaultVehicle.vehicleNumber})`
            : current.selectedVehicleLabel,
        }));

        if (defaultVehicle) {
          const normalizedVehicleType =
            savedVehicleTypeMap[String(defaultVehicle.vehicleType).toLowerCase()] ?? "Sedan";
          setVehicle(normalizedVehicleType);
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchClosedSlots = async () => {
      try {
        const res = await fetch("/api/admin/closed-slots");
        const data = await res.json();
        if (data.success && Array.isArray(data.slots)) {
          setClosedSlots(data.slots);
        }
      } catch (error) {
        console.error("Fetch closed slots error:", error);
      }
    };

    fetchClosedSlots();
  }, []);

  useEffect(() => {
    if (!selectedVehicle) return;

    const normalizedVehicleType =
      savedVehicleTypeMap[String(selectedVehicle.vehicleType).toLowerCase()] ?? "Sedan";

    setVehicle(normalizedVehicleType);
    setBookingData((current) => ({
      ...current,
      vehicle: `${selectedVehicle.brand} ${selectedVehicle.model}`.trim(),
      vehicleNumber: selectedVehicle.vehicleNumber,
      vehicleId: selectedVehicle._id,
      selectedVehicleLabel: `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.vehicleNumber})`,
    }));
  }, [selectedVehicle]);

  useEffect(() => {
    const fetchClosedDays = async () => {
      try {
        const res = await fetch("/api/admin/closed-days");
        const data = await res.json();
        if (data.success && Array.isArray(data.days)) {
          const nextClosedDays = data.days.map((d: { date: string; reason?: string }) => ({
            date: d.date,
            reason: d.reason,
          }));

          setClosedDays(nextClosedDays);

          const visibleWeek = getWeekDays(weekOffset);
          const selectedDayInWeek = visibleWeek.find((day) => day.isoDate === selectedDate);
            const selectedDayClosed =
            !!selectedDayInWeek &&
            (selectedDayInWeek.isSunday ||
              nextClosedDays.some(
                (closedDay: { date: string; reason?: string }) =>
                  closedDay.date === selectedDayInWeek.isoDate
              ));
              
          if (!selectedDayInWeek || selectedDayClosed) {
            setSelectedDate(getFirstAvailableDayIso(weekOffset, nextClosedDays));
          }
        }
      } catch (error) {
        console.error("Fetch closed days error:", error);
      }
    };

    fetchClosedDays();
  }, []);

  const weekDays = getWeekDays(weekOffset);
  const isThisWeek = weekOffset === 0;
  const isNextWeek = weekOffset === 1;

  const cycleVehicle = (direction: "next" | "prev") => {
    const currentIndex = vehicleTypes.indexOf(vehicle);
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % vehicleTypes.length
        : (currentIndex - 1 + vehicleTypes.length) % vehicleTypes.length;

    setVehicle(vehicleTypes[nextIndex]);
  };

  const handleVehicleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleVehicleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 40;

    if (Math.abs(deltaX) >= swipeThreshold) {
      cycleVehicle(deltaX < 0 ? "next" : "prev");
    }

    setTouchStartX(null);
  };

  const parseTimeSlot = (date: string, time: string) => {
    const [clock, meridiemRaw] = time.split(" ");
    const [hourRaw, minuteRaw] = clock.split(":").map(Number);
    const meridiem = meridiemRaw.toLowerCase();
    let hour = hourRaw;

    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const slotDateTime = new Date(`${date}T00:00:00`);
    slotDateTime.setHours(hour, minuteRaw || 0, 0, 0);
    return slotDateTime;
  };

  const isPastSlot = (date: string, time: string) => {
    const slotDateTime = parseTimeSlot(date, time);
    const currentHourStart = new Date(now);
    currentHourStart.setMinutes(0, 0, 0);
    return slotDateTime < currentHourStart;
  };

  const getUsedSlotCount = (date: string, time: string) => {
    return slotBookings.filter(
      (booking) =>
        booking.bookingDate === date &&
        booking.bookingTime === time &&
        booking.serviceCategory === "fullservice" &&
        booking.status !== "Cancelled"
    ).length;
  };

  const getSlotStatusText = (usedSlots: number) => {
    const remainingSlots = Math.max(0, FULLSERVICE_SLOTS - usedSlots);
    if (remainingSlots === 0) return "Fully booked";
    if (remainingSlots === 1) return "1 slot available";
    return "2 slots available";
  };
  const toggleService = (service: ServiceOption) => {
    if (service.locked) return;

    setSelectedServices((prev) =>
      prev.includes(service.key)
        ? prev.filter((item) => item !== service.key)
        : [...prev, service.key]
    );
  };

  const handleConfirmServices = async () => {
    setIsGeneratingQuote(true);
    setHasPromptedQuotationConfirmation(false);
    const servicesToSubmit = selectedServices.filter(
      (service) => service !== "oilFilter"
    );

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "generate_quote",
          bookingData: {
            ...bookingData,
            serviceType: selectedPlan,
            vehicleType: pricingVehicleTypeMap[vehicle],
            services: servicesToSubmit,
            additionalServices: selectedAdditionalServices,
          },
        }),
      });

      const data = await res.json();

      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      }

      if (data.pdfDownloadUrl) {
        setPdfDownloadUrl(data.pdfDownloadUrl);
      }

      if (data.cloudinaryPdfUrl) {
        setCloudinaryPdfUrl(data.cloudinaryPdfUrl);
      }

      if (data.quotationNumber) {
        setQuotationNumber(data.quotationNumber);
      }

      if (data.bookingData) {
        setBookingData(data.bookingData);
      }

      if (data.nextStage) {
        setStage(data.nextStage);
      }
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const handleQuotationOpen = () => {
    if (hasPromptedQuotationConfirmation) {
      return;
    }

    const confirmationPrompt = `Please confirm your booking for ${bookingData.bookingDate} at ${bookingData.bookingTime}. Is this convenient for you?`;

    setMessages((prev) => [...prev, { role: "ai", text: confirmationPrompt }]);
    setStage("confirm_slot");
    setHasPromptedQuotationConfirmation(true);
  };

  const openChat = async () => {
    setIsChatOpen(true);

    if (messages.length > 0 || stage !== "start") {
      return;
    }

    setPdfUrl(null);
    setPdfDownloadUrl(null);
    setCloudinaryPdfUrl(null);
    setQuotationNumber(null);

    const initialBookingData = {
      ...bookingData,
      serviceType: selectedPlan,
      vehicleType: pricingVehicleTypeMap[vehicle],
      services: selectedServices,
      additionalServices: selectedAdditionalServices,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      hasSavedVehicles: vehicles.length > 0,
      selectedVehicleLabel:
        selectedVehicle
          ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.vehicleNumber})`
          : bookingData.selectedVehicleLabel,
    };

    setBookingData(initialBookingData);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: "start",
        serviceType: selectedPlan,
        bookingData: initialBookingData,
      }),
    });

    const data = await res.json();

    if (data.reply) {
      setMessages([{ role: "ai", text: data.reply }]);
    }

    if (data.pdfUrl) {
      setPdfUrl(data.pdfUrl);
    }

    if (data.pdfDownloadUrl) {
      setPdfDownloadUrl(data.pdfDownloadUrl);
    }

    if (data.cloudinaryPdfUrl) {
      setCloudinaryPdfUrl(data.cloudinaryPdfUrl);
    }

    if (data.quotationNumber) {
      setQuotationNumber(data.quotationNumber);
    }

    if (data.bookingData) {
      setBookingData(data.bookingData);
    }

    if (data.nextStage) {
      setStage(data.nextStage);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages(prev => [...prev, userMessage]);

    const updatedBookingData = {
      ...bookingData,
      serviceType: selectedPlan,
      vehicleType: pricingVehicleTypeMap[vehicle],
      services: selectedServices,
      additionalServices: selectedAdditionalServices,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
    };

    if (stage === "make_model") {
      updatedBookingData.vehicle = input;
    }

    if (stage === "oil_info") {
      const oilGradeMatch = input.match(/\b\d{1,2}w-\d{2}\b/i);
      const mileageMatch = input.match(/\d+/);

      if (oilGradeMatch) {
        updatedBookingData.oilGrade = oilGradeMatch[0].toUpperCase();
      }

      if (mileageMatch) {
        const mileage = parseInt(mileageMatch[0], 10);
        updatedBookingData.mileage = mileage;

        if (!oilGradeMatch) {
          updatedBookingData.oilGrade = mileage >= 100000 ? "10W-40" : "5W-30";
        }
      }
    }

    if (stage === "details_name") {
      updatedBookingData.customerName = input.trim();
    }

    if (stage === "details_mobile") {
      updatedBookingData.mobile = input.trim();
    }

    if (stage === "details_vehicle") {
      updatedBookingData.vehicleNumber = input.trim();
    }

    setBookingData(updatedBookingData);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        stage,
        serviceType: selectedPlan,
        bookingData: updatedBookingData,
      }),
    });

    const data = await res.json();
    const aiMessage = { role: "ai" as const, text: data.reply };
    setMessages(prev => [...prev, aiMessage]);

    if (data.pdfUrl) {
      setPdfUrl(data.pdfUrl);
    }

    if (data.pdfDownloadUrl) {
      setPdfDownloadUrl(data.pdfDownloadUrl);
    }

    if (data.cloudinaryPdfUrl) {
      setCloudinaryPdfUrl(data.cloudinaryPdfUrl);
    }

    if (data.quotationNumber) {
      setQuotationNumber(data.quotationNumber);
    }

    if (data.bookingData) {
      setBookingData(data.bookingData);
    }

    if (data.nextStage) {
      setStage(data.nextStage);
    }

    setInput("");
  };

  return (
    <main className={`${styles.page} ${inter.className}`}>
      
      {/* STEP 01 - HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.contentWrapper}>
          <p className={`${styles.stepTag} ${oswald.className}`}>STEP 01</p>
          <h1 className={`${styles.heroTitle} ${oswald.className}`}>Choose Your Vehicle Type</h1>
          
          <nav className={styles.carTypeNav}>
            {vehicleTypes.map((type) => (
              <button
                key={type}
                className={`${styles.typeBtn} ${vehicle === type ? styles.activeBtn : ""}`}
                onClick={() => setVehicle(type)}
              >
                {type}
              </button>
            ))}
          </nav>
        </div>

        <div
          className={styles.carContainer}
          onTouchStart={handleVehicleTouchStart}
          onTouchEnd={handleVehicleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={vehicle}
              src={carImages[vehicle]}
              alt={vehicle}
              className={styles.displayCar}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          <div className={styles.mobileVehicleControls}>
            <div className={styles.mobileVehicleBadge}>
              <span className={styles.mobileVehicleLabel}>{vehicle}</span>
            </div>
          </div>
          <span className={styles.mobileSwipeHint}>Swipe For Change Vehicle Type</span>
        </div>
      </section>

      {/* STEP 02 - SERVICE PACKAGES */}
      <section className={styles.planSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 02</p>
          <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Service Type</h2>
          
          <div className={styles.planGrid}>
            {/* FULL SERVICE CARD */}
            <div 
              className={`${styles.planCard} ${selectedPlan === 'full' ? styles.activePlan : ""}`}
              onClick={() => setSelectedPlan('full')}
            >
              <FaTools className={styles.mainIcon} />
              <h3 className={styles.planName}>Full Service</h3>
              <div className={styles.quoteBadge}>Custom AI Quote</div>
              <ul className={styles.featureList}>
                <li><FaCheck className={styles.checkIcon}/> Engine Oil & Filter</li>
                <li><FaCheck className={styles.checkIcon}/> Brake Caliper Service</li>
                <li><FaCheck className={styles.checkIcon}/> Suspension Check</li>
                <li><FaCheck className={styles.checkIcon}/> Full Safety Diagnostic</li>
              </ul>
            </div>

            {/* OIL CHANGE CARD */}
            <div 
              className={`${styles.planCard} ${selectedPlan === 'oil' ? styles.activePlan : ""}`}
              onClick={() => setSelectedPlan('oil')}
            >
              <FaOilCan className={styles.mainIcon} />
              <h3 className={styles.planName}>Oil Change</h3>
              <div className={styles.quoteBadge}>Price Varies by Oil Type</div>
              <ul className={styles.featureList}>
                <li><FaCheck className={styles.checkIcon}/> Premium Engine Oil</li>
                <li><FaCheck className={styles.checkIcon}/> New Oil Filter</li>
                <li><FaCheck className={styles.checkIcon}/> Fluid Level Top-up</li>
                <li><FaCheck className={styles.checkIcon}/> Basic Safety Visual</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 03 - ADD-ONS */}
      <section className={styles.addonsSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 03</p>
          <h2 className={`${styles.sectionTitleLight} ${oswald.className}`}>Add Extra Services</h2>
          
          <div className={styles.addonsGrid}>
            {standardAddons.map(item => (
              <div 
                key={item.id} 
                className={`${styles.addonBox} ${extras.includes(item.id) ? styles.addonSelected : ""}`}
                onClick={() => toggleExtra(item.id)}
              >
                <div className={styles.addonInfo}>
                  <h4>{item.name}</h4>
                  <span>LKR {getExtraServicePrice(item, vehicle)} · Add to Quote</span>
                </div>
                <div className={styles.addonCircle}>
                  {extras.includes(item.id) ? <FaCheck /> : <FaPlus />}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {selectedPlan === 'oil' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.conditionalWrapper}
              >
                <h3 className={styles.subHeading}>Recommended for Oil Change</h3>
                <div className={styles.addonsGrid}>
                  {oilSpecificAddons.map(item => (
                    <div 
                      key={item.id} 
                      className={`${styles.addonBox} ${extras.includes(item.id) ? styles.addonSelected : ""}`}
                      onClick={() => toggleExtra(item.id)}
                    >
                      <div className={styles.addonInfo}>
                        <h4>{item.name}</h4>
                        <span>LKR {getExtraServicePrice(item, vehicle)} · Add to Quote</span>
                      </div>
                      <div className={styles.addonCircle}>
                         {extras.includes(item.id) ? <FaCheck /> : <FaPlus />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
      <section className={styles.dateTimeSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 04</p>
          <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Date and Time</h2>

          <div className={styles.calendarWrapper}>
            <div className={styles.mobileDaySelector}>
              <button
                type="button"
                className={styles.mobileWeekArrow}
                onClick={() => updateWeekOffset(0)}
                disabled={isThisWeek}
                aria-label="Show previous week"
              >
                {"<"}
              </button>
              {weekDays.map((item) => {
                const closedDayObj = closedDays.find((d) => d.date === item.isoDate);
                const isClosedDay = item.isSunday || !!closedDayObj;

                return (
                  <button
                    key={`mobile-${item.fullDate}`}
                    type="button"
                    className={`${styles.mobileDayChip} ${selectedDate === item.isoDate ? styles.mobileDayChipActive : ""} ${isClosedDay ? styles.mobileDayChipClosed : ""}`}
                    onClick={() => {
                      if (isClosedDay) return;
                      setSelectedDate(item.isoDate);
                    }}
                  >
                    <span className={styles.mobileDayChipDate}>{item.date}</span>
                    <span className={styles.mobileDayChipName}>{item.dayName.slice(0, 3)}</span>
                    <span className={styles.mobileDayChipMeta}>
                      {isClosedDay ? "Closed" : "Open"}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                className={styles.mobileWeekArrow}
                onClick={() => updateWeekOffset(1)}
                disabled={isNextWeek}
                aria-label="Show next week"
              >
                {">"}
              </button>
            </div>
            <div className={styles.calendarHeader}>
              {weekDays.map((item) => {
                const closedDayObj = closedDays.find(
                  (d) => d.date === item.isoDate
                );
                const isClosedDay = item.isSunday || !!closedDayObj;

                return (
                <div
                  key={item.fullDate}
                  className={`${styles.dayCol} ${selectedDate === item.isoDate ? styles.dayActive : ""} ${isClosedDay ? styles.dayClosed : ""}`}
                  onClick={() => {
                    if (isClosedDay) return;
                    setSelectedDate(item.isoDate);
                  }}
                >
                  <span className={styles.dateNum}>{item.date}</span>
                  <span className={`${styles.dayName} ${isClosedDay ? styles.sundayRed : ""}`}>
                    {item.dayName}
                  </span>
                </div>
                );
              })}
            </div>

              <div className={styles.calendarBody}>
                {weekDays.map((item) => (
                <div
                  key={item.fullDate}
                  className={`${styles.timeCol} ${selectedDate === item.isoDate ? styles.timeColSelected : ""}`}
                >
                  <div
                    className={`${styles.mobileDayHeader} ${selectedDate === item.isoDate ? styles.mobileDayActive : ""}`}
                  >
                    <span className={styles.mobileDayDate}>{item.date}</span>
                    <span className={styles.mobileDayName}>{item.dayName}</span>
                  </div>
                  {(() => {
                    const closedDayObj = closedDays.find(
                      (d) => d.date === item.isoDate
                    );
                    const isClosedDay = item.isSunday || !!closedDayObj;

                    if (isClosedDay) {
                      return (
                        <div className={styles.closedWrapper}>
                          <span className={styles.closedLabel}>
                            {item.isSunday ? "Closed" : closedDayObj?.reason || "Closed"}
                          </span>
                        </div>
                      );
                    }

                    return timeSlots.map((time) => {
                        const usedSlots = getUsedSlotCount(item.isoDate, time);
                        const isFull = usedSlots >= FULLSERVICE_SLOTS;
                        const isPast = isPastSlot(item.isoDate, time);
                        const slotDateTime = parseTimeSlot(item.isoDate, time);
                        const isAdminClosed = closedSlots.some((slot) => {
                          if (slot.date !== item.isoDate) return false;

                          const start = parseTimeSlot(slot.date, slot.startTime);
                          const end = parseTimeSlot(slot.date, slot.endTime);

                          return slotDateTime >= start && slotDateTime < end;
                        });
                        const isUnavailable = isFull || isPast || isAdminClosed;
                        const isBlocked = isFull || isPast;
                        const isSelected = selectedDate === item.isoDate && selectedTime === time;

                        return (
                          <div
                            key={time}
                            className={`${styles.timeSlot} ${isSelected ? styles.timeSelected : ""} ${isBlocked ? styles.timeFull : ""} ${isAdminClosed ? styles.timeClosed : ""}`}
                            onClick={() => {
                              if (isUnavailable) return;
                              setSelectedDate(item.isoDate);
                              setSelectedTime(time);
                            }}
                          >
                            <span className={styles.timeText}>{time}</span>
                            <div className={styles.slotBox}>
                              {[1, 2].map((slotNo) => (
                                <div
                                  key={slotNo}
                                  className={`${styles.slotSegment} ${slotNo <= usedSlots ? styles.segmentBooked : styles.segmentOpen}`}
                                >
                                  {slotNo}
                                </div>
                              ))}
                            </div>
                            <span className={styles.slotHint}>
                              {isAdminClosed ? "Closed" : isPast ? "Unavailable" : getSlotStatusText(usedSlots)}
                            </span>
                          </div>
                        );
                    });
                  })()}
                </div>
              ))}
            </div>
          </div>
           <div className={styles.buttonContainer}>
  <button 
    onClick={() => updateWeekOffset(0)} 
    disabled={weekOffset === 0} 
    className={styles.calendarBtn}
  >
    <span>⬅</span> This Week
  </button>

  <button 
    onClick={() => updateWeekOffset(1)} 
    disabled={weekOffset === 1} 
    className={styles.calendarBtn}
  >
    Next Week <span>➡</span>
  </button>
</div>
        </div>
      </section>

      <section className={styles.aiBookingSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 05</p>
          <h2 className={`${styles.sectionTitleLight} ${oswald.className}`}>Get AI Quote and Confirm</h2>
          <div className={styles.aiActionWrapper}>
            <button className={styles.aiQuoteBtn} onClick={openChat}>
              <FaRobot className={styles.botIcon} />
              GENERATE AI QUOTE FOR MY {vehicle.toUpperCase()}
            </button>

            <p className={styles.aiHint}>
              Selected slot: {selectedDate} at {selectedTime}
            </p>
          </div>
        </div>
      </section>
      <AnimatePresence>
  {isChatOpen && (
    <motion.div
      className={styles.chatOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.chatContainer}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
      >
        <div className={styles.chatHeader}>
          <h3>AutoFlash AI Assistant</h3>
          <button onClick={() => setIsChatOpen(false)}>X</button>
        </div>

        <div className={styles.chatBody}>
          {vehicles.length > 0 && (
            <div className={styles.serviceBox}>
              <div className={styles.serviceSectionTitle}>Saved Vehicle</div>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedVehicleId(id);
                  setSelectedVehicle(vehicles.find((item) => item._id === id) ?? null);
                }}
              >
                <option value="">Select Saved Vehicle</option>
                {vehicles.map((savedVehicle) => (
                  <option key={savedVehicle._id} value={savedVehicle._id}>
                    {savedVehicle.vehicleNumber} - {savedVehicle.brand} {savedVehicle.model}
                  </option>
                ))}
              </select>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? styles.userMessage
                  : styles.aiMessage
              }
            >
              {msg.text}
            </div>
          ))}


          {stage === "select_services" && (
            <div className={styles.serviceBox}>
              <div className={styles.serviceSectionTitle}>Core Service Items</div>
              {activeServiceList.map((service) => (
                <label key={service.key} className={styles.serviceOption}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.key)}
                    disabled={service.locked}
                    onChange={() => toggleService(service)}
                  />
                  <span
                    className={service.free ? styles.serviceFreeLabel : ""}
                  >
                    {getServiceLabel(service)}
                  </span>
                  {service.locked && (
                    <span className={styles.serviceRequired}>(Required)</span>
                  )}
                </label>
              ))}

              <div className={styles.serviceSectionTitle}>Selected Extra Services</div>
              {hasSelectedAdditionalServices ? (
                selectedAdditionalServices.map((service) => (
                  <label key={`extra-${service.id}`} className={styles.serviceOption}>
                    <input
                      type="checkbox"
                      checked={extras.includes(service.id)}
                      onChange={() => toggleExtra(service.id)}
                    />
                    <span>{service.name}</span>
                    <span className={styles.servicePrice}>LKR {service.price}</span>
                  </label>
                ))
              ) : (
                <div className={styles.serviceEmptyState}>
                  No extra services selected yet.
                </div>
              )}

              <button
                className={styles.serviceContinueButton}
                disabled={isGeneratingQuote}
                onClick={handleConfirmServices}
              >
                {isGeneratingQuote ? "Generating quotation..." : "Continue"}
              </button>
              {isGeneratingQuote && (
                <div className={styles.serviceProgress}>
                  Please wait while we generate your quotation PDF.
                </div>
              )}
            </div>
          )}

          {pdfUrl && (
            <div className={styles.pdfActions}>
              {quotationNumber && (
                <div className={styles.pdfLabel}>{quotationNumber}</div>
              )}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pdfActionButton}
                onClick={handleQuotationOpen}
              >
                View quotation
              </a>
              <a
                href={pdfDownloadUrl ?? pdfUrl ?? cloudinaryPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pdfActionLink}
              >
                Download quotation
              </a>
            </div>
          )}
        </div>

        {stage !== "select_services" && (
          <div className={styles.chatInputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
      </AnimatePresence>

    </main>
  );
}














