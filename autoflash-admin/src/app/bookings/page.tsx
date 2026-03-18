"use client";

import { useEffect, useState } from "react";
import styles from "./bookings.module.css";

const parseJsonSafely = async (res: Response) => {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const formatServiceType = (serviceType?: any) => {
  const raw =
    typeof serviceType === "string"
      ? serviceType
      : typeof serviceType?.name === "string"
      ? serviceType.name
      : "";
  const key = raw.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return raw || "";
};

const getServiceLabel = (service: any) => {
  if (typeof service === "string") return service;
  if (!service || typeof service !== "object") return "";

  const name = typeof service.name === "string" ? service.name : "";
  if (name) return name;

  const id = service.id || service._id;
  return id ? String(id) : "";
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
const formatSmsPhone = (mobile?: string) => {
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
    const loadBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await parseJsonSafely(res);

        if (!res.ok) {
          console.error("Failed to load bookings:", data);
          setBookings([]);
          return;
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      }
    };

    loadBookings();
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
      const serviceLabel = formatServiceType(booking.serviceType);
      const payload = {
        bookingRef,
        name: booking.customerName,
        service: serviceLabel,
        additionalServices: booking.additionalServices ?? [],
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

        const smsPhone = formatSmsPhone(booking.mobile);
        if (smsPhone) {
          await fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: smsPhone,
              name: booking.customerName,
              vehicleNumber: booking.vehicleNumber ?? booking.vehicle ?? "",
              bookingDate,
              bookingTime,
              service: serviceLabel,
              bookingRef,
            }),
          });
        }
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

        const smsPhone = formatSmsPhone(booking.mobile);
        if (smsPhone) {
          const smsMessage = `Mr. ${booking.customerName},

Your booking has been cancelled.

Ref: ${bookingRef}

If this is a mistake, please contact us.

Thank you for choosing AutoFlash.`;

          await fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: smsPhone,
              message: smsMessage,
            }),
          });
        }
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
            <th>Vehicle</th>
            <th>Service</th>
            <th>Additional Services</th> 
            <th>Date</th>                 
            <th>Time</th>                 
            <th>Status</th>
          </tr>
        </thead>

       <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking._id}>
              <td>
                <div style={{ fontWeight: '500' }}>{formatCustomerName(booking.customerName)}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{booking.mobile}</div>
              </td>
              <td>
        <div style={{ fontWeight: "500", color: "#f8fafc" }}>
          {booking.vehicle} {booking.vehicleModel ? `- ${booking.vehicleModel}` : ""}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#6366f1", marginTop: "2px" }}>
          {formatVehicleNumber(booking.vehicleNumber)}
        </div>
      </td>
              <td>{formatServiceType(booking.serviceType)}</td>
              
              {/* Additional Services Display */}
              <td>
                <div className={styles.additionalBadgeContainer}>
                  {booking.additionalServices && booking.additionalServices.length > 0 ? (
                    booking.additionalServices.map((service: any, index: number) => (
                      <span key={index} className={styles.serviceBadge}>
                        {getServiceLabel(service) || "Unnamed Service"}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#475569", fontSize: "0.85rem" }}>None</span>
                  )}
                </div>
              </td>

              {/* Split Date and Time */}
              <td>{booking.bookingDate || booking.date || "-"}</td>
              <td>{booking.bookingTime || booking.time || "-"}</td>

              <td>
                <select
                  className={`${styles.statusSelect} ${
                    booking.status === "Pending" ? styles.pending :
                    booking.status === "Confirmed" ? styles.confirmed :
                    booking.status === "In Progress" ? styles.inprogress :
                    booking.status === "Completed" ? styles.completed : styles.cancelled
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
