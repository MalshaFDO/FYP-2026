'use client';

import { useEffect, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { Oswald, Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheck,
  FaTimes,
  FaRegClock,
  FaArrowAltCircleRight,
  FaCar,
  FaTint,
  FaHistory,
  FaReceipt,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { PiEngineFill } from "react-icons/pi";
import styles from "./Bodywash.module.css";

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

type VehicleType = 'Sedan' | 'SUV' | 'Pickup' | 'MiniVan';
type SavedVehicleType = VehicleType | Lowercase<VehicleType>;

interface Plan {
  id: number;
  name: string;
  price: number;
  cents: number;
  time: string;
  duration: number;
  features: boolean[];
  dark?: boolean;
}

interface SlotBooking {
  bookingDate: string;
  bookingTime: string;
  status?: string;
  serviceCategory?: "bodywash" | "fullservice";
}

interface SavedVehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: SavedVehicleType;
  brand: string;
  model: string;
  currentOil?: string;
}

type ExtraService =
  | {
      id: number;
      name: string;
      time: string;
      price: number;
      icon: ReactNode;
      desc: string;
    }
  | {
      id: number;
      name: string;
      time: string;
      priceByVehicle: Record<VehicleType, number>;
      icon: ReactNode;
      desc: string;
    };

const featureLabels = [
  "BodyWash",
  "Vacuum",
  "WAX",
  "UnderBodyWash"
];

/* ---------------- DATA ---------------- */

const carImages: Record<VehicleType, string> = {
  Sedan: "/01.png",
  SUV: "/02.png",
  Pickup: "/03.png",
  MiniVan: "/04.png",
};

const vehicleTypes: VehicleType[] = ["Sedan", "SUV", "Pickup", "MiniVan"];

const savedVehicleTypeMap: Record<string, VehicleType> = {
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Pickup",
  minivan: "MiniVan",
};

const pricing: Record<VehicleType, Plan[]> = {
  Sedan: [
    { id: 1, name: "Quick Wash", price: 900, cents: 0, time: "15 min", duration: 15, features: [true, false, false, false] },
    { id: 2, name: "Bodywash & Vacuum", price: 1450, cents: 0, time: "30 min", duration: 30, features: [true, true, false, false] },
    { id: 3, name: "Wash, Vacuum & WAX", price: 1950, cents: 0, time: "45 min", duration: 45, features: [true, true, true, false] },
    { id: 4, name: "Full Bodywash", price: 3600, cents: 0, time: "120 min", duration: 120, features: [true, true, true, true], dark: true },
  ],
  SUV: [
    { id: 1, name: "Quick Wash", price: 1100, cents: 0, time: "20 min", duration: 20, features: [true, false, false, false] },
    { id: 2, name: "Bodywash & Vacuum", price: 1750, cents: 0, time: "35 min", duration: 35, features: [true, true, false, false] },
    { id: 3, name: "Wash, Vacuum & WAX", price: 2250, cents: 0, time: "50 min", duration: 50, features: [true, true, true, false] },
    { id: 4, name: "Full Bodywash", price: 4100, cents: 0, time: "130 min", duration: 130, features: [true, true, true, true], dark: true },
  ],
  Pickup: [
    { id: 1, name: "Quick Wash", price: 1250, cents: 0, time: "25 min", duration: 25, features: [true, false, false, false] },
    { id: 2, name: "Bodywash & Vacuum", price: 2000, cents: 0, time: "40 min", duration: 40, features: [true, true, false, false] },
    { id: 3, name: "Wash, Vacuum & WAX", price: 2450, cents: 0, time: "55 min", duration: 55, features: [true, true, true, false] },
    { id: 4, name: "Full Bodywash", price: 4600, cents: 0, time: "140 min", duration: 140, features: [true, true, true, true], dark: true },
  ],
  MiniVan: [
    { id: 1, name: "Quick Wash", price: 1550, cents: 0, time: "30 min", duration: 30, features: [true, false, false, false] },
    { id: 2, name: "Bodywash & Vacuum", price: 2400, cents: 0, time: "45 min", duration: 45, features: [true, true, false, false] },
    { id: 3, name: "Wash, Vacuum & WAX", price: 2800, cents: 0, time: "60 min", duration: 60, features: [true, true, true, false] },
    { id: 4, name: "Full Bodywash", price: 4850, cents: 0, time: "160 min", duration: 160, features: [true, true, true, true], dark: true },
  ],
};

const additionalServices: ExtraService[] = [
  { id: 1, name: "Leather Treatment", time: "30 min", price: 3850, icon: <FaCar />, desc: "Cleans, conditions, and protects leather from cracks and fading." },
  { id: 2, name: "RainX", time: "15 min", price: 650, icon: <FaTint />, desc: "Water-repellent coating improving visibility during rain on glass surfaces." },
  { id: 3, name: "Tar Removal", time: "15 min", price: 650, icon: <FaHistory />, desc: "Eliminates sticky tar spots from paint without damaging finish." },
  {
    id: 4,
    name: "Engine Wash",
    time: "45 min",
    priceByVehicle: { Sedan: 1750, SUV: 1950, Pickup: 2450, MiniVan: 1950 },
    icon: <PiEngineFill/>,
    desc: "Removes dirt and grease from engine for better performance.",
  },
  { id: 5, name: "Head Light Polish", time: "45 min", price: 1200, icon: <FaCar />, desc: "Restores clarity by removing oxidation and yellowing from headlights." },

  { id: 6, name: "UnderBody Wax", time: "30 min",
    priceByVehicle: { Sedan: 1600, SUV: 1950, Pickup: 2450, MiniVan: 2800 }, 
    icon: <FaCar />, 
    desc: "Protective coating preventing rust and corrosion underneath vehicle." },
];

const hasPriceByVehicle = (extra: ExtraService): extra is Extract<ExtraService, { priceByVehicle: Record<VehicleType, number> }> =>
  "priceByVehicle" in extra;

const getExtraPrice = (extra: ExtraService, vehicle: VehicleType) => {
  return hasPriceByVehicle(extra) ? extra.priceByVehicle[vehicle] : extra.price;
};

// Generates a week starting from today plus `offset * 7` days.
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
const timeSlots = ['08:00 am','09:00 am', '10:00 am', '11:00 am', '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm'];

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

export default function BookingPage() {
  const BODYWASH_SLOTS = 3;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<SavedVehicle | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(3);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState('02:00 pm');
  const [slotBookings, setSlotBookings] = useState<SlotBooking[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [closedSlots, setClosedSlots] = useState<
    { date: string; startTime: string; endTime: string; reason?: string }[]
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
  // 0 = current week, 1 = next week

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

  const formatVehicleNumber = (value: string) => {
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    const letters = cleaned.slice(0, 3);
    const numbers = cleaned.slice(3, 7);

    if (!letters) return "";
    if (!numbers) return letters;
    return `${letters} - ${numbers}`;
  };

  const toggleExtra = (id: number) => {
    setSelectedExtras(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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
    setSelectedPlanId(3);
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
  const currentPlan = pricing[vehicle].find(p => p.id === selectedPlanId);
  const extrasTotal = selectedExtras.reduce((total, id) => {
    const extra = additionalServices.find(e => e.id === id);
    return total + (extra ? getExtraPrice(extra, vehicle) : 0);
  }, 0);
  const extrasDuration = selectedExtras.reduce((total, id) => {
    const extra = additionalServices.find(e => e.id === id);
    const minutes = extra?.time ? parseInt(extra.time, 10) : 0;
    return total + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);
  const selectedExtraDetails = selectedExtras
    .map((id) => additionalServices.find((extra) => extra.id === id))
    .filter((extra): extra is ExtraService => Boolean(extra))
    .map((extra) => ({
      id: extra.id,
      name: extra.name,
      time: extra.time,
      price: getExtraPrice(extra, vehicle),
    }));
  const finalTotal = (currentPlan?.price || 0) + extrasTotal;
  const bookingDate = selectedDate;
  const bookingTime = selectedTime;
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
        booking.serviceCategory === "bodywash" &&
        booking.status !== "Cancelled"
    ).length;
  };
  const selectedTimeUsedSlots = getUsedSlotCount(bookingDate, bookingTime);
  const isSelectedTimeFull = selectedTimeUsedSlots >= BODYWASH_SLOTS;
  const isSelectedTimePast = isPastSlot(bookingDate, bookingTime);
  const getSlotStatusText = (usedSlots: number) => {
    const remainingSlots = Math.max(0, BODYWASH_SLOTS - usedSlots);
    if (remainingSlots === 0) return "Fully booked";
    if (remainingSlots === 1) return "1 slot available";
    if (remainingSlots === 2) return "2 slots available";
    if (remainingSlots === 3) return "3 slots available";
    return "Fully booked";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !vehicleNumber || !phone) {
      alert("Please fill required fields");
      return;
    }
    if (!selectedVehicleId) {
      alert("Please select a saved vehicle.");
      return;
    }
    if (isSelectedTimeFull) {
      alert(`Selected time (${bookingTime}) is already full. Please choose another hour.`);
      return;
    }
    if (isSelectedTimePast) {
      alert(`Selected time (${bookingTime}) is unavailable because it has already passed. Please choose another hour.`);
      return;
    }

    try {
      const formattedVehicleNumber = formatVehicleNumber(vehicleNumber);
       
      const res = await fetch("/api/bookings?type=bodywash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle,
          serviceType: currentPlan?.name || "Bodywash",
          additionalServices: selectedExtraDetails,
          customerName: `${firstName} ${lastName}`,
          mobile: phone,
          email,
          vehicleNumber: formattedVehicleNumber,
          vehicleModel,
          vehicleId: selectedVehicleId,
          bookingDate,
          bookingTime,
          totalPrice: finalTotal,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const slotText = data.booking?.hourSlot
          ? ` (slot ${data.booking.hourSlot}/${BODYWASH_SLOTS} for ${bookingTime})`
          : "";
        alert(`Booking successfully created${slotText}!`);
        window.location.reload();
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        if (!token) return;

        const res = await fetch("/api/vehicles/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      } catch (error) {
        console.error("Fetch vehicles error:", error);
      }
    };

    fetchVehicles();
  }, [token]);
  
const [closedDays, setClosedDays] = useState<
  { date: string; reason?: string }[]
>([]);

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
    if (selectedVehicle) {
      const normalizedVehicleType =
        savedVehicleTypeMap[selectedVehicle.vehicleType.toLowerCase()] ?? "Sedan";

      setVehicle(normalizedVehicleType);
      setVehicleNumber(selectedVehicle.vehicleNumber);
      setVehicleModel(`${selectedVehicle.brand} ${selectedVehicle.model}`.trim());
    }
  }, [selectedVehicle]);


  return (
    <main className={`${styles.page} ${inter.className}`}>

      {/* STEP 01 */}
      <section className={styles.heroSection}>
        <div className={styles.contentWrapper}>
          <p className={`${styles.stepTag} ${oswald.className}`}>STEP 01</p>
          <h1 className={`${styles.heroTitle} ${oswald.className}`}>Choose Your Car Type</h1>
          <nav className={styles.carTypeNav}>
            {vehicleTypes.map(type => (
              <button
                key={type}
                className={`${styles.typeBtn} ${vehicle === type ? styles.activeBtn : ""}`}
                onClick={() => {
                  setVehicle(type);
                  setSelectedPlanId(3);
                }}
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

      {/* STEP 02 - UPDATED WITH FEATURES AND HOVER */}
      <section className={styles.plansSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 02</p>
          <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Washing Plan</h2>

          <div className={styles.plansGrid}>
            {pricing[vehicle].map(plan => (
              <div 
                key={plan.id} 
                className={`${styles.planCard} ${plan.dark ? styles.darkCard : ""} ${selectedPlanId === plan.id ? styles.cardActive : ""}`}
              >
                <h3 className={`${styles.planName} ${oswald.className}`}>{plan.name}</h3>

                <div className={styles.priceContainer}>
                  <span className={styles.currency}>LKR.</span>
                  <span className={styles.priceMain}>{plan.price}</span>
                  <span className={styles.priceCents}>.{String(plan.cents).padStart(2, "0")}</span>
                </div>

                <ul className={styles.featureList}>
                  {plan.features.map((isIncluded, idx) => (
                    <li key={idx} className={isIncluded ? styles.featIncluded : styles.featExcluded}>
                      {isIncluded ? <FaCheck className={styles.checkIcon} /> : <FaTimes className={styles.crossIcon} />}
                      {featureLabels[idx]}
                    </li>
                  ))}
                </ul>

                <div className={styles.timeTag}>
                  <FaRegClock className={styles.clockIconRed} /> {plan.time}
                </div>

                <button
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`${styles.planBtn} ${selectedPlanId === plan.id ? styles.selectedBtn : styles.unselectedBtn}`}
                >
                  {selectedPlanId === plan.id ? <>Selected <FaCheck/></> : <>Select plan <FaArrowAltCircleRight/></>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 03 */}
      <section className={styles.additionalSection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 03</p>
          <h2 className={`${styles.sectionTitleLight} ${oswald.className}`}>Additional Services</h2>
          <p className={styles.sectionSubtitle}>Praesent tempor mauris sem, eu molestie metus sollicitudin sit amet.</p>

          <div className={styles.additionalGrid}>
            {additionalServices.map(service => (
              <div
                key={service.id}
                className={`${styles.additionalCard} ${selectedExtras.includes(service.id) ? styles.extraSelected : ""}`}
                onClick={() => toggleExtra(service.id)}
              >
                <div className={styles.cardInternal}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <div className={styles.serviceText}>
                    <h3 className={oswald.className}>{service.name}</h3>
                    <p>{service.desc}</p>
                    <div className={styles.extraMetaInline}>
                      <span><FaHistory className={styles.metaIcon} /> {service.time}</span>
                      <span><FaReceipt className={styles.metaIcon} /> LKR.{getExtraPrice(service, vehicle)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.extraBtn}>
                  {selectedExtras.includes(service.id) ? <FaCheck/> : "+"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* STEP 04 - DATE AND TIME */}
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
      {/* Header Row */}
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

      {/* Time Grid Body */}
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
          {item.isSunday
            ? "Closed"
            : closedDayObj?.reason || "Closed"}
        </span>
      </div>
    );
  }

  return timeSlots.map((time) => {
                const usedSlots = getUsedSlotCount(item.isoDate, time);
                const isFull = usedSlots >= BODYWASH_SLOTS;
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
                      {[1, 2, 3].map((slotNo) => (
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
</section>
      {/* ================= STEP 05 ================= */}
      <section className={styles.summarySection}>
        <div className={styles.containerLarge}>
          <p className={styles.stepTagCenter}>STEP 05</p>
          <h2 className={`${styles.sectionTitle} ${oswald.className}`}>
            Summary & Confirmation
          </h2>

          <div className={styles.summaryGrid}>
            {/* LEFT SIDE - SUMMARY CARDS */}
            <div className={styles.infoCards}>
              <SummaryCard
                icon={<FaCar />}
                label="CAR TYPE"
                value={vehicle}
              />

              <SummaryCard
                icon={<FaTint />}
                label="WASHING PLAN"
                value={currentPlan?.name || "Choose Your Plan"}
                isError={!currentPlan}
              />

              <SummaryCard
                icon={<FaCalendarAlt />}
                label="BOOKING DATE"
                value={bookingDate || "Choose Booking Date"}
                isError={!bookingDate}
              />

              <SummaryCard
                icon={<FaClock />}
                label="BOOKING TIME"
                value={bookingTime || "Choose Booking Time"}
                isError={!bookingTime}
              />

              <SummaryCard
                icon={<FaHistory />}
                label="DURATION"
                value={`${(currentPlan?.duration || 0) + extrasDuration} min`}
              />

              <SummaryCard
                icon={<FaReceipt />}
                label="TOTAL PRICE"
                value={`LKR.${finalTotal}`}
              />
            </div>

            {/* RIGHT SIDE - CONTACT FORM */}
            <div className={styles.contactFormBox}>
              <h3 className={styles.contactHeading}>
                Please input your <span>contact details</span>
              </h3>

              <p className={styles.contactSub}>
                In order to make booking you need to choose a plan,
                time and fill all required form fields.
              </p>

              <form className={styles.finalForm} onSubmit={handleSubmit}>
                {vehicles.length > 0 && (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedVehicleId(id);

                      const vehicle = vehicles.find((v) => v._id === id) ?? null;
                      setSelectedVehicle(vehicle);
                    }}
                  >
                    <option value="">Select Saved Vehicle</option>
                    {vehicles.map((savedVehicle) => (
                      <option key={savedVehicle._id} value={savedVehicle._id}>
                        {savedVehicle.vehicleNumber} - {savedVehicle.brand} {savedVehicle.model}
                      </option>
                    ))}
                  </select>
                )}

                <div className={styles.formRow}>
                  <input
  placeholder="First Name *"
  required
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
/>
                  <input
  placeholder="Last Name"
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
/>
                </div>

                  <div className={styles.formRow}>
                  <input
  type="text"
  placeholder="Vehicle Number (e.g. CAA - 1234)"
  value={vehicleNumber}
  disabled={!!selectedVehicle}
  onChange={(e) => setVehicleNumber(e.target.value)}
/>
                  <input
  placeholder="Vehicle Make & Model"
  required
  value={vehicleModel}
  disabled={!!selectedVehicle}
  onChange={(e) => setVehicleModel(e.target.value)}
/>
                </div>

                <div className={styles.formRow}>
                 <input
  placeholder="Phone Number *"
  required
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
                 <input
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
                </div>

               <textarea
  placeholder="Additional information"
  rows={4}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>

<button
  type="submit"
  className={styles.submitBtn}
  disabled={!currentPlan || !bookingDate || !bookingTime || !selectedVehicleId || isSelectedTimeFull || isSelectedTimePast}
>
  Send request
</button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  isError,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isError?: boolean;
}) {
  return (
    <div className={`${styles.summaryCard} ${isError ? styles.summaryError : ""}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>{value}</p>
    </div>
  );
}

