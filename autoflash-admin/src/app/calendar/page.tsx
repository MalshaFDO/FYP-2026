"use client";

import { useEffect, useState } from "react";

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
  "08:00 am", "09:00 am", "10:00 am", "11:00 am", "12:00 pm",
  "01:00 pm", "02:00 pm", "03:00 pm", "04:00 pm", "05:00 pm",
];

const getNext14Days = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      display: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
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
  
  // States for filters and blocking
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
        fetch("/api/closed-slots")
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

  // Format Vehicle Number: CC1234 -> CC - 1234
  const formatVehicleNumber = (vn: string | undefined) => {
    if (!vn) return "N/A";
    const clean = vn.replace(/[-\s]/g, "").toUpperCase();
    const letters = clean.match(/[A-Z]+/);
    const numbers = clean.match(/[0-9]+/);
    if (letters && numbers) return `${letters[0]} - ${numbers[0]}`;
    return clean;
  };

  // Filter and Group Logic
  const getFilteredBookings = (isoDate: string) => {
    return bookings.filter((b) => {
      const matchesDate = b.bookingDate?.split("T")[0] === isoDate;
      const matchesSearch = 
        b.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService = filterService === "All" || b.serviceType === filterService;
      return matchesDate && matchesSearch && matchesService;
    });
  };

  const groupBookingsBySection = (isoDate: string) => {
    const filtered = getFilteredBookings(isoDate);
    const sections: Record<string, Booking[]> = {};
    filtered.forEach(b => {
      if (!sections[b.serviceType]) sections[b.serviceType] = [];
      sections[b.serviceType].push(b);
    });
    return sections;
  };

  const calculateDailyTotal = (isoDate: string) => {
    return getFilteredBookings(isoDate).reduce((sum, b) => sum + b.totalPrice, 0);
  };

  // API Handlers
  const handleCloseDay = async (targetDate: string) => {
    if (!confirm(`Warning: Close the shop for this entire day?`)) return;
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
    await fetch("/api/closed-days", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }) });
    fetchData();
  };

  const handleReopenSlot = async (slotId: string) => {
    await fetch("/api/closed-slots", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slotId }) });
    fetchData();
  };

  const groupedData = selectedDate ? groupBookingsBySection(selectedDate) : {};

  // Styles
  const inputStyle = {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px", gap: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px", fontWeight: "800" }}>Admin Calendar Management</h2>
          {selectedDate && (
            <div style={{ marginTop: "10px", display: "flex", gap: "12px" }}>
              <div style={{ backgroundColor: "#ecfdf5", padding: "6px 14px", borderRadius: "10px", border: "1px solid #d1fae5" }}>
                <span style={{ fontSize: "13px", color: "#065f46", fontWeight: "600" }}>Daily Total: </span>
                <b style={{ color: "#059669" }}>LKR {calculateDailyTotal(selectedDate).toLocaleString()}</b>
              </div>
              <div style={{ backgroundColor: "#eef2ff", padding: "6px 14px", borderRadius: "10px", border: "1px solid #e0e7ff" }}>
                <span style={{ fontSize: "13px", color: "#3730a3", fontWeight: "600" }}>Bookings: </span>
                <b style={{ color: "#4f46e5" }}>{getFilteredBookings(selectedDate).length}</b>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "10px", backgroundColor: "#fff", padding: "8px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <input 
            type="text" 
            placeholder="Search Vehicle or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, width: "260px" }}
          />
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="All">All Services</option>
            <option value="Wash">Wash</option>
            <option value="Interior">Interior</option>
            <option value="Full Service">Full Service</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "30px" }}>
        {/* Sidebar */}
        <div style={{ width: "320px" }}>
          {days.map((day) => {
            const isSelected = selectedDate === day.iso;
            const closed = closedDays.find((d) => d.date === day.iso);
            const count = getFilteredBookings(day.iso).length;
            return (
              <div
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                style={{
                  padding: "16px",
                  cursor: "pointer",
                  background: isSelected ? "#6366f1" : closed ? "#ef4444" : "#fff",
                  color: isSelected || closed ? "#fff" : "#1e293b",
                  marginBottom: "12px",
                  borderRadius: "14px",
                  boxShadow: isSelected ? "0 10px 15px -3px rgba(99, 102, 241, 0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: isSelected ? "none" : "1px solid #e2e8f0"
                }}
              >
                <div>
                  <div style={{ fontWeight: "700" }}>{day.display}</div>
                  {closed && <div style={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>{closed.reason}</div>}
                </div>
                {count > 0 && !closed && (
                  <span style={{ background: isSelected ? "#fff" : "#6366f1", color: isSelected ? "#6366f1" : "#fff", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "900" }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Agenda Area */}
        <div style={{ flex: 1, backgroundColor: "#fff", borderRadius: "24px", padding: "35px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
          {selectedDate ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>Settings for {new Date(selectedDate).toDateString()}</h3>
                <button 
                  onClick={() => closedDays.find(d => d.date === selectedDate) ? handleReopenDay(selectedDate) : handleCloseDay(selectedDate)}
                  style={{ backgroundColor: closedDays.find(d => d.date === selectedDate) ? "#22c55e" : "#ef4444", color: "white", border: "none", padding: "12px 25px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                  {closedDays.find(d => d.date === selectedDate) ? "Reopen Shop" : "Full Day Close"}
                </button>
              </div>

              {!closedDays.find(d => d.date === selectedDate) && (
                <div style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "18px", marginBottom: "35px", border: "1px solid #edf2f7" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "12px", textTransform: "uppercase", color: "#64748b" }}>Block Specific Hours</h4>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle}>{timeSlots.map(t => <option key={t}>{t}</option>)}</select>
                    <span style={{ color: "#94a3b8" }}>to</span>
                    <select value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle}>{timeSlots.map(t => <option key={t}>{t}</option>)}</select>
                    <input type="text" placeholder="Reason (e.g. Lunch)" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={handleCloseTimeRange} style={{ background: "#1e293b", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>Apply</button>
                  </div>
                </div>
              )}

              <h4 style={{ marginBottom: "20px", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>Scheduled Appointments</h4>
              <div style={{ display: "grid", gap: "25px" }}>
                {Object.keys(groupedData).length > 0 ? (
                  Object.entries(groupedData).map(([section, items]) => (
                    <div key={section}>
                      <div style={{ color: "#6366f1", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderLeft: "4px solid #6366f1", paddingLeft: "10px" }}>
                        {section} ({items.length})
                      </div>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {items.map((b) => (
                          <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
                              <div style={{ color: "#6366f1", fontWeight: "900", fontSize: "15px", width: "85px" }}>{b.bookingTime}</div>
                              <div>
                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "17px" }}>{b.customerName}</div>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Tel: {b.mobile || "No Mobile"}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", background: "#fff", padding: "5px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "inline-block" }}>
                                {formatVehicleNumber(b.vehicleNumber)}
                              </div>
                              <div style={{ fontWeight: "800", color: "#0f172a", marginTop: "6px" }}>LKR {b.totalPrice.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", backgroundColor: "#f8fafc", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
                    No activity scheduled for this day.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexDirection: "column" }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>📅</div>
              <p style={{ fontWeight: "600" }}>Select a date from the left to view agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
