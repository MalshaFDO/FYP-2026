"use client";

import { useEffect, useState } from "react";
import styles from "./bookings.module.css";

const formatServiceType = (serviceType?: string) => {
  const key = serviceType?.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return serviceType || "";
};

const normalizeServiceText = (service: string) =>
  service
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const isBodyWashService = (service: string) => {
  const normalized = normalizeServiceText(service);
  const compact = normalized.replace(/\s+/g, "");

  return (
    normalized === "quick wash" ||
    compact === "quickwash" ||
    normalized === "bodywash vacuum" ||
    normalized === "wash vacuum" ||
    normalized === "wash vacuum wax" ||
    normalized === "bodywash vacuum wax" ||
    normalized === "full bodywash" ||
    compact === "fullbodywash"
  );
};

const isFullServiceCategory = (service: string) => {
  const normalized = normalizeServiceText(service);
  return normalized === "full service" || normalized === "oil change";
};

const formatVehicleNumber = (vehicleNumber?: string) => {
  let formattedVehicleNumber = vehicleNumber
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (formattedVehicleNumber) {
    const match = formattedVehicleNumber.match(/^([A-Z]+)(\d+)$/);

    if (match) {
      const letters = match[1];
      const numbers = match[2];
      formattedVehicleNumber = `${letters} - ${numbers}`;
    }
  }

  return formattedVehicleNumber || "";
};

const formatCustomerName = (name?: string) => (name || "").trim().toUpperCase();
const formatBookingTime = (booking: any) =>
  booking?.bookingTime || booking?.time || booking?.date || "-";
const formatWhatsappPhone = (mobile?: string) => {
  const raw = mobile?.toString().trim() || "";
  if (!raw) return "";
  if (raw.startsWith("0")) return "94" + raw.substring(1);
  if (raw.startsWith("+")) return raw.substring(1);
  return raw;
};
const buildBookingRef = (booking: any) =>
  booking?.bookingRef ||
  booking?.reference ||
  `AF-${String(booking?._id || Date.now()).slice(-6).toUpperCase()}`;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    const booking = bookings.find((b) => b._id === id);

    if (booking && (status === "Confirmed" || status === "Cancelled")) {
      const bookingRef = buildBookingRef(booking);
      const bookingDate = booking.bookingDate || booking.date || "";
      const bookingTime = booking.bookingTime || "";
      const payload = {
        bookingRef,
        name: booking.customerName,
        service: booking.serviceType,
        vehicleNumber: booking.vehicleNumber ?? booking.vehicle ?? "Not provided",
        price: booking.totalPrice ?? booking.price ?? booking.amount ?? "Not provided",
        venue: booking.venue ?? "Autoflash Service Center",
        bookingDate,
        bookingTime,
        date: bookingDate,
        time: bookingTime,
      };

      if (status === "Confirmed") {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            to: booking.email,
          }),
        });

        await fetch("/api/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            phone: formatWhatsappPhone(booking.mobile),
            template: "confirm",
          }),
        });
      }

      if (status === "Cancelled") {
        await fetch("/api/send-cancel-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            to: booking.email,
          }),
        });

        await fetch("/api/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            phone: formatWhatsappPhone(booking.mobile),
            template: "cancel",
          }),
        });
      }
    }

    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
  };

  const filteredBookings = bookings.filter((booking) => {
    const service = formatServiceType(booking.serviceType).toLowerCase();
    const search = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");

    let matchesCategory = true;

    if (filter === "BodyWash") {
      matchesCategory = isBodyWashService(service);
    }

    if (filter === "Full Service") {
      matchesCategory = isFullServiceCategory(service);
    }

    if (filter === "Interior") {
      matchesCategory =
        service.includes("interior") ||
        service.includes("cut") ||
        service.includes("polish");
    }

    const matchesSearch =
      booking.customerName?.toLowerCase().includes(search) ||
      booking.mobile?.toLowerCase().includes(search) ||
      booking.email?.toLowerCase().includes(search) ||
      formatVehicleNumber(booking.vehicleNumber)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <h2>All Bookings</h2>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by name, mobile, email or vehicle number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            width: "320px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {["All", "BodyWash", "Full Service", "Interior"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "8px 15px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: filter === cat ? "#6366f1" : "#1e293b",
              color: "white",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Mobile</th>
            <th>Vehicle</th>
            <th>Vehicle No</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking._id}>
              <td>{formatCustomerName(booking.customerName)}</td>
              <td>{booking.mobile}</td>
              <td>{booking.vehicle}</td>
              <td>{formatVehicleNumber(booking.vehicleNumber)}</td>
              <td>{formatServiceType(booking.serviceType)}</td>
              <td>{formatBookingTime(booking)}</td>
              <td>
                <select
                  className={`${styles.statusSelect} ${
                    booking.status === "Pending"
                      ? styles.pending
                      : booking.status === "Confirmed"
                      ? styles.confirmed
                      : booking.status === "In Progress"
                      ? styles.inprogress
                      : booking.status === "Completed"
                      ? styles.completed
                      : styles.cancelled
                  }`}
                  value={booking.status}
                  onChange={(e) => updateStatus(booking._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
