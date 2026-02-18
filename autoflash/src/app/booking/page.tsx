'use client';

import { useState } from "react";
import type { ReactNode } from "react";
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
import styles from "./Booking.module.css";

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

type VehicleType = 'Sedan' | 'SUV' | 'Pickup' | 'MiniVan';

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

const featureLabels = [
  "Exterior washing",
  "Vacuum cleaning",
  "Interior wet cleaning",
  "Window wiping"
];

/* ---------------- DATA ---------------- */

const carImages: Record<VehicleType, string> = {
  Sedan: "/01.png",
  SUV: "/02.png",
  Pickup: "/03.png",
  MiniVan: "/04.png",
};

const pricing: Record<VehicleType, Plan[]> = {
  Sedan: [
    { id: 1, name: "Express Washing", price: 12, cents: 99, time: "15 min", duration: 15, features: [true, false, false, false] },
    { id: 2, name: "Basic Cleaning", price: 24, cents: 99, time: "30 min", duration: 30, features: [true, true, false, false] },
    { id: 3, name: "Premium Service", price: 36, cents: 99, time: "45 min", duration: 45, features: [true, true, true, false] },
    { id: 4, name: "Full Complex", price: 59, cents: 99, time: "120 min", duration: 120, features: [true, true, true, true], dark: true },
  ],
  SUV: [
    { id: 1, name: "Express Washing", price: 16, cents: 99, time: "20 min", duration: 20, features: [true, false, false, false] },
    { id: 2, name: "Basic Cleaning", price: 28, cents: 99, time: "35 min", duration: 35, features: [true, true, false, false] },
    { id: 3, name: "Premium Service", price: 42, cents: 99, time: "50 min", duration: 50, features: [true, true, true, false] },
    { id: 4, name: "Full Complex", price: 69, cents: 99, time: "130 min", duration: 130, features: [true, true, true, true], dark: true },
  ],
  Pickup: [
    { id: 1, name: "Express Washing", price: 18, cents: 99, time: "25 min", duration: 25, features: [true, false, false, false] },
    { id: 2, name: "Basic Cleaning", price: 32, cents: 99, time: "40 min", duration: 40, features: [true, true, false, false] },
    { id: 3, name: "Premium Service", price: 48, cents: 99, time: "55 min", duration: 55, features: [true, true, true, false] },
    { id: 4, name: "Full Complex", price: 79, cents: 99, time: "140 min", duration: 140, features: [true, true, true, true], dark: true },
  ],
  MiniVan: [
    { id: 1, name: "Express Washing", price: 22, cents: 99, time: "30 min", duration: 30, features: [true, false, false, false] },
    { id: 2, name: "Basic Cleaning", price: 38, cents: 99, time: "45 min", duration: 45, features: [true, true, false, false] },
    { id: 3, name: "Premium Service", price: 55, cents: 99, time: "60 min", duration: 60, features: [true, true, true, false] },
    { id: 4, name: "Full Complex", price: 95, cents: 99, time: "160 min", duration: 160, features: [true, true, true, true], dark: true },
  ],
};

const additionalServices = [
  { id: 1, name: "Leather Restoration", time: "30 min", price: 29, icon: <FaCar />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
  { id: 2, name: "Window Cleaning", time: "15 min", price: 10, icon: <FaTint />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
  { id: 3, name: "Hard Stain Removing", time: "5 min", price: 4, icon: <FaHistory />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
  { id: 4, name: "Air Refresher", time: "25 min", price: 25, icon: <FaTint />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
  { id: 5, name: "Interior Polishing", time: "15 min", price: 12, icon: <FaCar />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
  { id: 6, name: "Tire Blacking", time: "10 min", price: 17, icon: <FaCar />, desc: "Nulla vel tempus diam. Nunc vulputate, quam sit amet commodo tincidunt." },
];

// 2. Add this helper function to generate the actual calendar week
const getWeekDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.getDate().toString().padStart(2, '0'),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      isSunday: d.getDay() === 0,
      fullDate: d.toDateString(),
    });
  }
  return days;
};
const timeSlots = ['09:00 am', '10:00 am', '11:00 am', '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm'];

export default function BookingPage() {
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [selectedPlanId, setSelectedPlanId] = useState<number>(3);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate().toString());
  const [selectedTime, setSelectedTime] = useState('02:00 pm');

  const toggleExtra = (id: number) => {
    setSelectedExtras(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const weekDays = getWeekDays();
  const currentPlan = pricing[vehicle].find(p => p.id === selectedPlanId);
  const extrasTotal = selectedExtras.reduce((total, id) => {
    const extra = additionalServices.find(e => e.id === id);
    return total + (extra?.price || 0);
  }, 0);
  const extrasDuration = selectedExtras.reduce((total, id) => {
    const extra = additionalServices.find(e => e.id === id);
    const minutes = extra?.time ? parseInt(extra.time, 10) : 0;
    return total + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);
  const finalTotal = (currentPlan?.price || 0) + extrasTotal;
  const bookingDate = selectedDate;
  const bookingTime = selectedTime;

  return (
    <main className={`${styles.page} ${inter.className}`}>

      {/* STEP 01 */}
      <section className={styles.heroSection}>
        <div className={styles.contentWrapper}>
          <p className={`${styles.stepTag} ${oswald.className}`}>STEP 01</p>
          <h1 className={`${styles.heroTitle} ${oswald.className}`}>Choose Your Car Type</h1>
          <nav className={styles.carTypeNav}>
            {(['Sedan','SUV','Pickup','MiniVan'] as VehicleType[]).map(type => (
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
                  <span className={styles.currency}>$</span>
                  <span className={styles.priceMain}>{plan.price}</span>
                  <span className={styles.priceCents}>.{plan.cents}</span>
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
                      <span><FaReceipt className={styles.metaIcon} /> ${service.price}</span>
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
      {/* Header Row */}
      <div className={styles.calendarHeader}>
        {weekDays.map((item) => (
          <div 
            key={item.fullDate} 
            className={`${styles.dayCol} ${selectedDate === item.date ? styles.dayActive : ""}`}
            onClick={() => !item.isSunday && setSelectedDate(item.date)}
          >
            <span className={styles.dateNum}>{item.date}</span>
            <span className={`${styles.dayName} ${item.isSunday ? styles.sundayRed : ""}`}>
              {item.dayName}
            </span>
          </div>
        ))}
      </div>

      {/* Time Grid Body */}
      <div className={styles.calendarBody}>
        {weekDays.map((item) => (
          <div key={item.fullDate} className={styles.timeCol}>
            {item.isSunday ? (
              <div className={styles.closedWrapper}>
                <span className={styles.closedLabel}>Closed</span>
              </div>
            ) : (
              timeSlots.map((time) => {
                const isSelected = selectedDate === item.date && selectedTime === time;
                return (
                  <div 
                    key={time} 
                    className={`${styles.timeSlot} ${isSelected ? styles.timeSelected : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    <span className={styles.timeText}>{time}</span>
                    {isSelected ? <FaCheck className={styles.timeCheck} /> : <span className={styles.timeDots}>...</span>}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
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
                value={`$${finalTotal}`}
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

              <form className={styles.finalForm}>
                <div className={styles.formRow}>
                  <input placeholder="First Name *" required />
                  <input placeholder="Last Name" />
                </div>

                <div className={styles.formRow}>
                  <input placeholder="Phone Number *" required />
                  <input placeholder="Email" />
                </div>

                <textarea
                  placeholder="Additional information"
                  rows={4}
                />

                <button
                  className={styles.submitBtn}
                  disabled={!currentPlan || !bookingDate || !bookingTime}
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
