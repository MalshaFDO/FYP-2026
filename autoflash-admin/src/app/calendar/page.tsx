"use client";

import { useEffect, useState } from "react";
import styles from "./calendar.module.css";

const parseJsonSafely = async (res: Response) => {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

interface Booking {
  _id: string;
  customerName: string;
  mobile?: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
  vehicleNumber?: string;
}

interface ClosedDay {
  date: string;
  reason: string;
}

interface ClosedSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

const timeSlots = [
  "08:00 am",
  "09:00 am",
  "10:00 am",
  "11:00 am",
  "12:00 pm",
  "01:00 pm",
  "02:00 pm",
  "03:00 pm",
  "04:00 pm",
  "05:00 pm",
];

const getNext14Days = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      display: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      iso: d.toISOString().split("T")[0],
    });
  }
  return days;
};

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [closedSlots, setClosedSlots] = useState<ClosedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("All");
  const [reason, setReason] = useState("");
  const [startTime, setStartTime] = useState("08:00 am");
  const [endTime, setEndTime] = useState("05:00 pm");

  const days = getNext14Days();

  const fetchData = async () => {
    try {
      const [bRes, cRes, sRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/closed-days"),
        fetch("/api/closed-slots"),
      ]);
      const [bData, cData, sData] = await Promise.all([
        parseJsonSafely(bRes),
        parseJsonSafely(cRes),
        parseJsonSafely(sRes),
      ]);

      if (Array.isArray(bData)) {
        setBookings(bData);
      } else if (!bRes.ok) {
        console.error("Failed to load bookings:", bData);
        setBookings([]);
      }
      if (cData?.success) setClosedDays(cData.days);
      if (sData?.success) setClosedSlots(sData.slots);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatVehicleNumber = (vn: string | undefined) => {
    if (!vn) return "N/A";
    const clean = vn.replace(/[-\s]/g, "").toUpperCase();
    const letters = clean.match(/[A-Z]+/);
    const numbers = clean.match(/[0-9]+/);
    if (letters && numbers) return `${letters[0]} - ${numbers[0]}`;
    return clean;
  };

  const getFilteredBookings = (isoDate: string) => {
    return bookings.filter((b) => {
      const matchesDate = b.bookingDate?.split("T")[0] === isoDate;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        b.vehicleNumber?.toLowerCase().includes(query) ||
        b.customerName?.toLowerCase().includes(query);
      const matchesService = filterService === "All" || b.serviceType === filterService;
      return matchesDate && matchesSearch && matchesService;
    });
  };

  const groupBookingsBySection = (isoDate: string) => {
    const filtered = getFilteredBookings(isoDate);
    const sections: Record<string, Booking[]> = {};
    filtered.forEach((b) => {
      if (!sections[b.serviceType]) sections[b.serviceType] = [];
      sections[b.serviceType].push(b);
    });
    return sections;
  };

  const calculateDailyTotal = (isoDate: string) => {
    return getFilteredBookings(isoDate).reduce((sum, b) => sum + b.totalPrice, 0);
  };

  const handleCloseDay = async (targetDate: string) => {
    if (!confirm("Warning: Close the shop for this entire day?")) return;
    await fetch("/api/closed-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: targetDate, reason: reason || "Shop Closed" }),
    });
    fetchData();
  };

  const handleCloseTimeRange = async () => {
    if (!selectedDate) return;
    await fetch("/api/closed-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, startTime, endTime, reason: reason || "Blocked" }),
    });
    setReason("");
    fetchData();
  };

  const handleReopenDay = async (date: string) => {
    await fetch("/api/closed-days", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    fetchData();
  };

  const handleReopenSlot = async (slotId: string) => {
    await fetch("/api/closed-slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slotId }),
    });
    fetchData();
  };

  const groupedData = selectedDate ? groupBookingsBySection(selectedDate) : {};
  const selectedDayClosed = selectedDate
    ? closedDays.find((d) => d.date === selectedDate)
    : null;
  const selectedDaySlots = selectedDate
    ? closedSlots.filter((slot) => slot.date === selectedDate)
    : [];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Admin Calendar</p>
          <h2 className={styles.title}>Manage the next 14 days from one clean schedule board.</h2>
          <p className={styles.subtitle}>
            Review bookings, block time ranges, and control shop availability with the
            same admin visual style used across the portal.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Date Bookings</span>
            <span className={styles.statValue}>
              {selectedDate ? getFilteredBookings(selectedDate).length : 0}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Daily Revenue</span>
            <span className={styles.statValue}>
              LKR {selectedDate ? calculateDailyTotal(selectedDate).toLocaleString() : "0"}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Closed Days</span>
            <span className={styles.statValue}>{closedDays.length}</span>
          </div>
        </div>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.toolbarCard}>
          <input
            type="text"
            placeholder="Search vehicle or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`admin-input ${styles.searchInput}`}
          />
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Services</option>
            <option value="Wash">Wash</option>
            <option value="Interior">Interior</option>
            <option value="Full Service">Full Service</option>
          </select>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          {days.map((day) => {
            const isSelected = selectedDate === day.iso;
            const closed = closedDays.find((d) => d.date === day.iso);
            const count = getFilteredBookings(day.iso).length;
            return (
              <div
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`${styles.dayButton} ${
                  isSelected ? styles.daySelected : closed ? styles.dayClosed : ""
                }`}
              >
                <div>
                  <div className={styles.dayTitle}>{day.display}</div>
                  {closed ? <div className={styles.dayReason}>{closed.reason}</div> : null}
                </div>
                {count > 0 && !closed ? <span className={styles.dayCount}>{count}</span> : null}
              </div>
            );
          })}
        </div>

        <div className={styles.agenda}>
          {selectedDate ? (
            <>
              <div className={styles.agendaHeader}>
                <h3 className={styles.agendaTitle}>
                  Settings for {new Date(selectedDate).toDateString()}
                </h3>
                <button
                  onClick={() =>
                    selectedDayClosed
                      ? handleReopenDay(selectedDate)
                      : handleCloseDay(selectedDate)
                  }
                  className={selectedDayClosed ? styles.successButton : styles.dangerButton}
                >
                  {selectedDayClosed ? "Reopen Shop" : "Full Day Close"}
                </button>
              </div>

              {!selectedDayClosed ? (
                <div className={styles.blockPanel}>
                  <h4 className={styles.panelLabel}>Block Specific Hours</h4>
                  <div className={styles.blockRow}>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="admin-select"
                    >
                      {timeSlots.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <span className={styles.divider}>to</span>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="admin-select"
                    >
                      {timeSlots.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Reason (e.g. Lunch)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="admin-input"
                    />
                    <button onClick={handleCloseTimeRange} className={styles.secondaryButton}>
                      Apply
                    </button>
                  </div>
                </div>
              ) : null}

              {selectedDaySlots.length > 0 ? (
                <div className={styles.blockPanel}>
                  <h4 className={styles.panelLabel}>Blocked Time Ranges</h4>
                  <div className={styles.serviceList}>
                    {selectedDaySlots.map((slot) => (
                      <div key={slot._id} className={styles.bookingCard}>
                        <div>
                          <div className={styles.bookingName}>
                            {slot.startTime} to {slot.endTime}
                          </div>
                          <div className={styles.bookingPhone}>{slot.reason}</div>
                        </div>
                        <button
                          onClick={() => handleReopenSlot(slot._id)}
                          className={styles.successButton}
                        >
                          Reopen Slot
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <h4 className={styles.sectionTitle}>Scheduled Appointments</h4>
              <div>
                {Object.keys(groupedData).length > 0 ? (
                  Object.entries(groupedData).map(([section, items]) => (
                    <div key={section} className={styles.serviceGroup}>
                      <div className={styles.serviceHeader}>
                        {section} ({items.length})
                      </div>
                      <div className={styles.serviceList}>
                        {items.map((b) => (
                          <div key={b._id} className={styles.bookingCard}>
                            <div className={styles.bookingLeft}>
                              <div className={styles.bookingTime}>{b.bookingTime}</div>
                              <div>
                                <div className={styles.bookingName}>{b.customerName}</div>
                                <div className={styles.bookingPhone}>
                                  Tel: {b.mobile || "No Mobile"}
                                </div>
                              </div>
                            </div>
                            <div className={styles.bookingRight}>
                              <div className={styles.vehicleBadge}>
                                {formatVehicleNumber(b.vehicleNumber)}
                              </div>
                              <div className={styles.price}>LKR {b.totalPrice.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>No activity scheduled for this day.</div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.agendaPlaceholder}>
              <div className={styles.placeholderIcon}>📅</div>
              <p>Select a date from the left to view agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
