"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import RevenueChart from "@/components/RevenueChart";

const STATUS_CLASSES: Record<string, string> = {
  Pending: styles.pending,
  Confirmed: styles.confirmed,
  "In Progress": styles.inprogress,
  Completed: styles.completed,
  Cancelled: styles.cancelled,
};

const formatServiceType = (serviceType?: string) => {
  const key = serviceType?.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return serviceType || "";
};

const formatCustomerName = (name?: string) => (name || "").trim().toUpperCase();
const formatValue = (value?: string) => (value ? value.trim() : "-");

const formatVehicleNumber = (vehicleNumber?: string) => {
  let formattedVehicleNumber = vehicleNumber?.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (formattedVehicleNumber) {
    const match = formattedVehicleNumber.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      formattedVehicleNumber = `${match[1]} - ${match[2]}`;
    }
  }
  return formattedVehicleNumber || "-";
};

const formatBookingTime = (booking: any) => formatValue(booking?.bookingTime || booking?.time);

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
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Admin Control Room</p>
          <h2 className={styles.heroTitle}>
            Modern operations,
            <span>bookings, revenue, and customers in one view.</span>
          </h2>
          <p className={styles.heroDescription}>
            A denser dashboard for daily operations with live booking stats, monthly revenue,
            and quick health checks.
          </p>
          <div className={styles.quickActions}>
            <span>Bookings</span>
            <span>Customers</span>
            <span>Vehicles</span>
            <span>Record Books</span>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroRing}>
            <div className={styles.heroRingInner}>
              <span>Today</span>
              <strong>{stats.todaysBookings}</strong>
              <small>active bookings</small>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div>
              <span>Pending</span>
              <strong>{stats.pendingCount}</strong>
            </div>
            <div>
              <span>Confirmed</span>
              <strong>{stats.confirmedCount}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>{stats.completedCount}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statGrid}>
        {[
          ["Total bookings", stats.totalBookings],
          ["Total customers", stats.totalCustomers],
          ["Open jobs", stats.pendingCount],
          ["In progress", stats.inProgressCount],
          ["Completed", stats.completedCount],
          ["Cancelled", stats.cancelledCount],
          ["Revenue total", `LKR ${stats.totalRevenue}`],
          ["Completed revenue", `LKR ${stats.completedRevenue}`],
          ["Monthly revenue", `LKR ${stats.monthlyRevenue}`],
        ].map(([label, value]) => (
          <article key={label} className={styles.metricCard}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.dualGrid}>
        <article className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Revenue overview</p>
              <h3>Monthly earnings trend</h3>
            </div>
            <span className={styles.sectionPill}>Live data</span>
          </div>
          <div className={styles.chartFrame}>
            <RevenueChart data={stats.monthlyChartData} />
          </div>
        </article>

        <article className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Queue health</p>
              <h3>Booking state breakdown</h3>
            </div>
          </div>

          <div className={styles.stateList}>
            {[
              ["Pending", stats.pendingCount],
              ["Confirmed", stats.confirmedCount],
              ["In progress", stats.inProgressCount],
              ["Completed", stats.completedCount],
              ["Cancelled", stats.cancelledCount],
            ].map(([label, value]) => (
              <div key={label} className={styles.stateRow}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>Recent activity</p>
            <h3>Latest bookings</h3>
          </div>
          <span className={styles.sectionPill}>{stats.recentBookings.length} items</span>
        </div>

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
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking: any) => (
                <tr key={booking._id}>
                  <td>{formatCustomerName(booking.customerName)}</td>
                  <td>{formatValue(booking.mobile)}</td>
                  <td>{formatVehicleNumber(booking.vehicleNumber)}</td>
                  <td>{booking.vehicle}</td>
                  <td>{formatServiceType(booking.serviceType)}</td>
                  <td>{formatBookingTime(booking)}</td>
                  <td>
                    <span className={`${styles.status} ${STATUS_CLASSES[booking.status] || ""}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--admin-muted)",
                  }}
                >
                  No recent bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
