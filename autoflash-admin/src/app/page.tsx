"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import RevenueChart from "@/components/RevenueChart";

const formatServiceType = (serviceType?: string) => {
  const key = serviceType?.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return serviceType || "";
};

const formatCustomerName = (name?: string) => (name || "").trim().toUpperCase();

const formatValue = (value?: string) => (value ? value.trim() : "-");

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

  return formattedVehicleNumber || "-";
};

const formatBookingTime = (booking: any) =>
  formatValue(booking?.bookingTime || booking?.time);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Admin Overview</p>
          <h2 className={styles.heroTitle}>
            <span>Keep bookings,</span>
            <span>customers, and</span>
            <span>revenue in sync.</span>
          </h2>
          <p className={styles.heroDescription}>
            Monitor bookings, revenue, and recent activity from one clean admin
            workspace built for faster daily operations.
          </p>
        </div>

        <div className={styles.heroMetaPanel}>
          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Open Jobs</span>
              <span className={styles.heroMetaValue}>{stats.pendingCount}</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Today</span>
              <span className={styles.heroMetaValue}>{stats.todaysBookings}</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Revenue</span>
              <span className={styles.heroMetaValue}>LKR {stats.monthlyRevenue}</span>
            </div>
          </div>
          <div className={styles.heroMetaNote}>
            Live snapshot of the admin workspace for today.
          </div>
        </div>
      </section>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings}</p>
        </div>

        <div className={styles.card}>
          <h3>Total Customers</h3>
          <p>{stats.totalCustomers}</p>
        </div>

        <div className={styles.card}>
          <h3>Today's Bookings</h3>
          <p>{stats.todaysBookings}</p>
        </div>

        <div className={styles.card}>
          <h3>Pending</h3>
          <p>{stats.pendingCount}</p>
        </div>

        <div className={styles.card}>
          <h3>Confirmed</h3>
          <p>{stats.confirmedCount}</p>
        </div>

        <div className={styles.card}>
          <h3>In Progress</h3>
          <p>{stats.inProgressCount}</p>
        </div>

        <div className={styles.card}>
          <h3>Completed</h3>
          <p>{stats.completedCount}</p>
        </div>

        <div className={styles.card}>
          <h3>Cancelled</h3>
          <p>{stats.cancelledCount}</p>
        </div>

        <div className={styles.card}>
          <h3>Total Revenue</h3>
          <p>LKR {stats.totalRevenue}</p>
        </div>

        <div className={styles.card}>
          <h3>Completed Revenue</h3>
          <p>LKR {stats.completedRevenue}</p>
        </div>

        <div className={styles.card}>
          <h3>This Month Revenue</h3>
          <p>LKR {stats.monthlyRevenue}</p>
        </div>
      </div>

      <section className={styles.chartSection}>
        <h2>Revenue Overview</h2>
        <div className={styles.chartFrame}>
          <RevenueChart data={stats.monthlyChartData} />
        </div>
      </section>

      <div className={styles.tableSection}>
        <h2>Recent Bookings</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile Number</th>
              <th>Vehicle Number</th>
              <th>Vehicle</th>
              <th>Service</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {stats.recentBookings.map((booking: any) => (
              <tr key={booking._id}>
                <td>{formatCustomerName(booking.customerName)}</td>
                <td>{formatValue(booking.mobile)}</td>
                <td>{formatVehicleNumber(booking.vehicleNumber)}</td>
                <td>{booking.vehicle}</td>
                <td>{formatServiceType(booking.serviceType)}</td>
                <td>{formatBookingTime(booking)}</td>
                <td>
                  <span
                    className={`${styles.status} ${
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
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
