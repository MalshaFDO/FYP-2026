'use client';

import { useEffect, useState } from "react";
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
  vehicleType?: PricingVehicleType;
  services?: string[];
  oilGrade: string;
  oilBrand?: string;
  mileage: number | null;
  bookingDate: string;
  bookingTime: string;
  customerName?: string;
  mobile?: string;
  vehicleNumber?: string;
  quotationNumber?: string;
  quote?: {
    items: Array<{ name: string; price: number }>;
    total: number;
  };
}

type ServiceOption = {
  key: string;
  label: string;
  locked?: boolean;
  free?: boolean;
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

const serviceList: ServiceOption[] = [
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

const fullServicePackageKeys = serviceList.map((service) => service.key);

const extraServiceMap: Record<number, string | undefined> = {
  6: "engineWash",
};

function getSelectedServiceKeys(selectedPlan: string, extras: number[]) {
  const keys = new Set<string>();

  if (selectedPlan === "full") {
    fullServicePackageKeys.forEach((key) => keys.add(key));
  }

  extras.forEach((id) => {
    const key = extraServiceMap[id];
    if (key) keys.add(key);
  });

  return Array.from(keys);
}

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

function toTitleCase(value?: string) {
  return String(value ?? "Mobil")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FullServicePage() {
  const FULLSERVICE_SLOTS = 2;
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [selectedPlan, setSelectedPlan] = useState<string>("full"); 
  const [extras, setExtras] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(getFirstOpenDayIso(0));
  const [selectedTime, setSelectedTime] = useState('02:00 pm');
  const [slotBookings, setSlotBookings] = useState<SlotBooking[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [closedSlots, setClosedSlots] = useState<
    { date: string; startTime: string; endTime: string; reason?: string }[]
  >([]);
  const [closedDays, setClosedDays] = useState<
    { date: string; reason?: string }[]
  >([]);

  const toggleExtra = (id: number) => {
    setExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const standardAddons = [
    { id: 1, name: "Wheel Alignment" },
    { id: 2, name: "Brake Fluid" },
    { id: 3, name: "Coolant Flush" },
    { id: 4, name: "Battery Health" },
    { id: 5, name: "Tire Rotation" },
    { id: 6, name: "Engine Wash" },
  ];

  const oilSpecificAddons = [
    { id: 101, name: "Quick Wash" },
    { id: 102, name: "Bodywash & Vacuum" },
    { id: 103, name: "Wash, Vacuum & WAX" },
    { id: 104, name: "Full Bodywash" },
  ];
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [cloudinaryPdfUrl, setCloudinaryPdfUrl] = useState<string | null>(null);
  const [quotationNumber, setQuotationNumber] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState(
    serviceList.map((s) => s.key)
  );
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [hasPromptedQuotationConfirmation, setHasPromptedQuotationConfirmation] =
    useState(false);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<
    | "start"
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

    return service.label;
  };

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
    const fetchClosedDays = async () => {
      try {
        const res = await fetch("/api/admin/closed-days");
        const data = await res.json();
        if (data.success && Array.isArray(data.days)) {
          setClosedDays(
            data.days.map((d: { date: string; reason?: string }) => ({
              date: d.date,
              reason: d.reason,
            }))
          );
        }
      } catch (error) {
        console.error("Fetch closed days error:", error);
      }
    };

    fetchClosedDays();
  }, []);

  const weekDays = getWeekDays(weekOffset);

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
            vehicleType: pricingVehicleTypeMap[vehicle],
            services: servicesToSubmit,
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
      vehicleType: pricingVehicleTypeMap[vehicle],
      services: selectedServices,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
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
      vehicleType: pricingVehicleTypeMap[vehicle],
      services: selectedServices,
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
            {(['Sedan', 'SUV', 'Pickup', 'MiniVan'] as VehicleType[]).map((type) => (
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

        <div className={styles.carContainer}>
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
                  <span>Add to Quote</span>
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
                        <span>Add to Quote</span>
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
                <div key={item.fullDate} className={styles.timeCol}>
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
        </div>
       <div className={styles.buttonContainer}>
  <button 
    onClick={() => setWeekOffset(0)} 
    disabled={weekOffset === 0} 
    className={styles.calendarBtn}
  >
    <span>⬅</span> This Week
  </button>

  <button 
    onClick={() => setWeekOffset(1)} 
    disabled={weekOffset === 1} 
    className={styles.calendarBtn}
  >
    Next Week <span>➡</span>
  </button>
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
              {serviceList.map((service) => (
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














