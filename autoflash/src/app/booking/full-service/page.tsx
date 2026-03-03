'use client';

import { useState } from "react";
import { Oswald, Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaPlus, FaOilCan, FaTools, FaRobot } from 'react-icons/fa';
import styles from "./FullService.module.css";

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

type VehicleType = 'Sedan' | 'SUV' | 'Pickup' | 'MiniVan';

const carImages: Record<VehicleType, string> = {
  Sedan: "/01.png",
  SUV: "/02.png",
  Pickup: "/03.png",
  MiniVan: "/04.png",
};

export default function FullServicePage() {
  const [vehicle, setVehicle] = useState<VehicleType>("Sedan");
  const [selectedPlan, setSelectedPlan] = useState<string>("full"); 
  const [extras, setExtras] = useState<number[]>([]);

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
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<
    "make_model" | "oil_info" | "quotation" | "details" | "done"
  >("make_model");

  const [bookingData, setBookingData] = useState<any>({
  vehicle: "",
  oilGrade: "",
  mileage: null,
});

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages(prev => [...prev, userMessage]);

    const updatedBookingData = { ...bookingData };
    if (stage === "make_model") {
      updatedBookingData.vehicle = input;
    }

    if (stage === "oil_info") {
      const mileageMatch = input.match(/\d+/);
      updatedBookingData.oilGrade = input;
      if (mileageMatch) {
        updatedBookingData.mileage = parseInt(mileageMatch[0], 10);
      }
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

          {/* FINAL AI ACTION BUTTON */}
          <div className={styles.aiActionWrapper}>
             <button
                 className={styles.aiQuoteBtn}
                   onClick={() => setIsChatOpen(true)} >
  <FaRobot className={styles.botIcon} />
  GENERATE AI QUOTE FOR MY {vehicle.toUpperCase()}
</button>

             <p className={styles.aiHint}>
                Our AI will ask for specific oil grades and vehicle details in the next step.
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
        </div>

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
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </main>
  );
}


