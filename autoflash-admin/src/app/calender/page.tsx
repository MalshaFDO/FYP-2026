"use client";

import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  customerName: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, []);

  const groupedBookings = bookings.reduce((acc: any, booking) => {
  if (!booking.bookingDate) return acc;

  // Only accept ISO format
  const isISO = booking.bookingDate.includes("T");

  if (!isISO) return acc;

  const dateObj = new Date(booking.bookingDate);

  if (isNaN(dateObj.getTime())) return acc;

  const date = dateObj.toDateString();

  if (!acc[date]) acc[date] = [];
  acc[date].push(booking);

  return acc;
}, {});

  return (
    <div style={{ padding: "30px" }}>
      <h2>Booking Calendar</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Date List */}
        <div style={{ width: "250px" }}>
          {dates.map((date) => (
            <div
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: "10px",
                cursor: "pointer",
                background:
                  selectedDate === date ? "#6366f1" : "#1e293b",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              {date}
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div style={{ flex: 1 }}>
          {selectedDate && (
            <>
              <h3>{selectedDate}</h3>
              {groupedBookings[selectedDate].map(
                (booking: Booking) => (
                  <div
                    key={booking._id}
                    style={{
                      background: "#0f172a",
                      padding: "15px",
                      marginBottom: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <strong>{booking.customerName}</strong>
                    <p>{booking.serviceType}</p>
                    <p>{booking.bookingTime}</p>
                    <p>LKR {booking.totalPrice}</p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}