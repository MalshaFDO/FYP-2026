"use client";

import { usePathname } from "next/navigation";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/bookings") return "Bookings";
    if (pathname === "/customers") return "Customers";
    if (pathname === "/record-books") return "Record Books";
    if (pathname === "/vehicles") return "Vehicles";
    if (pathname === "/services") return "Services";
    if (pathname === "/payments") return "Payments";

    return "Admin Panel";
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1>{getTitle()}</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.profile}>
          <div className={styles.avatar}></div>
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
}
