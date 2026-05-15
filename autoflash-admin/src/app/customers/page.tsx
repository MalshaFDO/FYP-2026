"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./customers.module.css";

type CustomerVehicle = {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  currentOil: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  vehicleCount: number;
  bookingCount: number;
  vehicles: CustomerVehicle[];
  lastBooking: null | {
    bookingDate: string;
    bookingTime: string;
    status: string;
  };
};

const parseJsonSafely = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "with-vehicles" | "with-bookings">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/customers", { cache: "no-store" });
        const data = await parseJsonSafely(res);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load customers");
        }

        setCustomers(Array.isArray(data.customers) ? data.customers : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "with-vehicles" && customer.vehicleCount > 0) ||
        (filter === "with-bookings" && customer.bookingCount > 0);

      const matchesSearch = !normalized
        ? true
        : [
            customer.name,
            customer.email,
            customer.phone,
            ...customer.vehicles.map((vehicle) => vehicle.vehicleNumber),
            ...customer.vehicles.map((vehicle) => `${vehicle.brand} ${vehicle.model}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized);

      return matchesFilter && matchesSearch;
    });
  }, [customers, filter, search]);

  const totalVehicles = customers.reduce((count, customer) => count + customer.vehicleCount, 0);
  const totalBookings = customers.reduce((count, customer) => count + customer.bookingCount, 0);
  const customersWithVehicles = customers.filter((customer) => customer.vehicleCount > 0).length;

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Customer directory</p>
          <h2 className={styles.title}>Clean customer records, grouped and easy to scan</h2>
          <p className={styles.copy}>
            Search by name, phone, email, or vehicle number. Use the filters to focus on customers
            with vehicles or booking history.
          </p>
        </div>

        <div className={styles.heroStats}>
          <article>
            <span>Total customers</span>
            <strong>{customers.length}</strong>
          </article>
          <article>
            <span>Vehicle owners</span>
            <strong>{customersWithVehicles}</strong>
          </article>
          <article>
            <span>Total vehicles</span>
            <strong>{totalVehicles}</strong>
          </article>
          <article>
            <span>Total bookings</span>
            <strong>{totalBookings}</strong>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.sectionKicker}>Browse customers</p>
            <h3>{filteredCustomers.length} matching records</h3>
          </div>
          <span className={styles.countPill}>{loading ? "Loading..." : "Live database"}</span>
        </div>

        <div className={styles.controls}>
          <input
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, vehicles, or contact details..."
          />

          <div className={styles.filterRow}>
            {[
              ["all", "All customers"],
              ["with-vehicles", "Vehicle owners"],
              ["with-bookings", "Booked customers"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? styles.activeFilter : styles.filterButton}
                onClick={() => setFilter(value as typeof filter)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <p className={styles.muted}>Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className={styles.muted}>No customers found.</p>
        ) : (
          <div className={styles.grid}>
            {filteredCustomers.map((customer) => (
              <article key={customer.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{customer.name || "Unnamed customer"}</h3>
                    <p>{customer.email || "No email"}</p>
                  </div>
                  <span className={styles.badge}>{customer.vehicleCount} vehicle(s)</span>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detail}>
                    <span>Phone</span>
                    <strong>{customer.phone || "-"}</strong>
                  </div>
                  <div className={styles.detail}>
                    <span>Bookings</span>
                    <strong>{customer.bookingCount}</strong>
                  </div>
                  <div className={`${styles.detail} ${styles.detailWide}`}>
                    <span>Joined</span>
                    <strong>{formatDate(customer.createdAt)}</strong>
                  </div>
                </div>

                {customer.vehicles.length > 0 && (
                  <div className={styles.vehicleList}>
                    {customer.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className={styles.vehicleChip}>
                        <strong>{vehicle.vehicleNumber}</strong>
                        <span>
                          {vehicle.brand} {vehicle.model}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {customer.lastBooking && (
                  <div className={styles.lastBooking}>
                    <span>Last booking</span>
                    <strong>
                      {customer.lastBooking.bookingDate} {customer.lastBooking.bookingTime}
                    </strong>
                    <small>{customer.lastBooking.status}</small>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
