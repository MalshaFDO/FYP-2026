"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./payments.module.css";

type Payment = {
  id: string;
  orderId: string;
  customerName: string;
  mobile: string;
  vehicleNumber: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
  totalPrice: number;
  remainingAmount: number;
  paymentOption: string;
  paymentStage: string;
  status: string;
  paidAt: string;
};

type PaymentSummary = {
  totalPaid: number;
  outstanding: number;
  paymentCount: number;
  partialCount: number;
};

const formatMoney = (value: number) => `LKR ${Number(value || 0).toLocaleString()}`;

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatStackedDate = (value: string) => {
  const raw = value?.trim() || "";
  if (!raw) return { year: "-", monthDay: "-" };

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T|\s)/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return {
      year,
      monthDay: `${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    };
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: String(parsed.getFullYear()),
      monthDay: `${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
        parsed.getDate()
      ).padStart(2, "0")}`,
    };
  }

  return { year: raw, monthDay: "-" };
};

const formatService = (value: string) => {
  const key = value?.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return value || "-";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalPaid: 0,
    outstanding: 0,
    paymentCount: 0,
    partialCount: 0,
  });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await fetch("/api/payments", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load payments");
        }

        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setSummary(data.summary || summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.toLowerCase().replace(/[^a-z0-9]/g, "");

    return payments.filter((payment) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "partial" && payment.remainingAmount > 0) ||
        (filter === "paid" && payment.remainingAmount === 0);

      const searchText = [
        payment.customerName,
        payment.mobile,
        payment.vehicleNumber,
        payment.orderId,
        payment.serviceType,
      ]
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      return matchesFilter && searchText.includes(normalizedSearch);
    });
  }, [filter, payments, search]);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Admin Payments</p>
        <h2>Payment History</h2>
        <p>
          Track full payments, half payments, and remaining balances from one
          payment ledger.
        </p>
      </div>

      <div className={styles.summaryGrid}>
        <div>
          <span>Total paid</span>
          <strong>{formatMoney(summary.totalPaid)}</strong>
        </div>
        <div>
          <span>Outstanding</span>
          <strong>{formatMoney(summary.outstanding)}</strong>
        </div>
        <div>
          <span>Payments</span>
          <strong>{summary.paymentCount}</strong>
        </div>
        <div>
          <span>Partial bookings</span>
          <strong>{summary.partialCount}</strong>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          className="admin-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, mobile, vehicle, service or order id..."
        />
        <div className={styles.filterRow}>
          {[
            ["all", "All"],
            ["paid", "Paid"],
            ["partial", "Remaining"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? styles.activeFilter : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Booking</th>
              <th>Payment</th>
              <th>Remaining</th>
              <th>Order</th>
              <th>Paid at</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <strong>{payment.customerName || "-"}</strong>
                  <span>{payment.mobile || "-"}</span>
                </td>
                <td>
                  <strong>{formatService(payment.serviceType)}</strong>
                  <span>{payment.vehicleNumber || "-"}</span>
                </td>
                <td>
                  {(() => {
                    const stackedDate = formatStackedDate(payment.bookingDate || "");
                    return (
                      <>
                        <strong>{stackedDate.year}</strong>
                        <span>{stackedDate.monthDay}</span>
                      </>
                    );
                  })()}
                  <span>{payment.bookingTime || "-"}</span>
                </td>
                <td>
                  <strong>{formatMoney(payment.amount)}</strong>
                  <span>
                    {payment.paymentStage === "remaining" ? "Remaining" : payment.paymentOption}
                  </span>
                </td>
                <td>
                  <strong>{formatMoney(payment.remainingAmount)}</strong>
                  <span className={payment.remainingAmount > 0 ? styles.partial : styles.paid}>
                    {payment.remainingAmount > 0 ? "Partially paid" : "Paid"}
                  </span>
                </td>
                <td>{payment.orderId || "-"}</td>
                <td>{formatDate(payment.paidAt)}</td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
