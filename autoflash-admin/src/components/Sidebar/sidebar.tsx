"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./sidebar.module.css";
import { useAdminLanguage } from "@/components/providers/AdminLanguageProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton/ThemeToggleButton";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type NavIconKind =
  | "dashboard"
  | "orders"
  | "payments"
  | "calendar"
  | "customers"
  | "records"
  | "vehicles"
  | "services"
  | "admins"
  | "profile";

const copy = {
  en: {
    logo: "AutoFlash Admin",
    sections: [
      {
        label: "Overview",
        items: [{ name: "Dashboard", path: "/", icon: "dashboard" as NavIconKind }],
      },
      {
        label: "Operations",
        items: [
          { name: "Bookings", path: "/bookings", icon: "orders" as NavIconKind },
          { name: "Pending Payments", path: "/payments", icon: "payments" as NavIconKind },
          { name: "Calendar", path: "/calendar", icon: "calendar" as NavIconKind },
        ],
      },
      {
        label: "Catalog",
        items: [
          { name: "Customers", path: "/customers", icon: "customers" as NavIconKind },
          { name: "Record Books", path: "/record-books", icon: "records" as NavIconKind },
          { name: "Vehicles", path: "/vehicles", icon: "vehicles" as NavIconKind },
          { name: "Services", path: "/services", icon: "services" as NavIconKind },
        ],
      },
      {
        label: "Access",
        items: [
          { name: "Admins", path: "/admins", icon: "admins" as NavIconKind },
          { name: "Profile", path: "/profile", icon: "profile" as NavIconKind },
        ],
      },
    ],
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
  },
  si: {
    logo: "AutoFlash Admin",
    sections: [
      {
        label: "Overview",
        items: [{ name: "Dashboard", path: "/", icon: "dashboard" as NavIconKind }],
      },
      {
        label: "Operations",
        items: [
          { name: "Bookings", path: "/bookings", icon: "orders" as NavIconKind },
          { name: "Pending Payments", path: "/payments", icon: "payments" as NavIconKind },
          { name: "Calendar", path: "/calendar", icon: "calendar" as NavIconKind },
        ],
      },
      {
        label: "Catalog",
        items: [
          { name: "Customers", path: "/customers", icon: "customers" as NavIconKind },
          { name: "Record Books", path: "/record-books", icon: "records" as NavIconKind },
          { name: "Vehicles", path: "/vehicles", icon: "vehicles" as NavIconKind },
          { name: "Services", path: "/services", icon: "services" as NavIconKind },
        ],
      },
      {
        label: "Access",
        items: [
          { name: "Admins", path: "/admins", icon: "admins" as NavIconKind },
          { name: "Profile", path: "/profile", icon: "profile" as NavIconKind },
        ],
      },
    ],
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
  },
} as const;

const ICON_PATHS: Record<NavIconKind, string> = {
  dashboard: "M4 6.5h5v5H4zM11 6.5h5v3h-5zM11 11.5h5v5h-5zM4 13h5v3.5H4z",
  orders: "M5 7h14M5 12h14M5 17h14M7.5 4h9l2 3H5z",
  payments: "M4.5 8h15v8h-15zM7 11h5M7 14h3",
  calendar: "M5 6h14v12H5zM8 4v4M16 4v4M5 10h14",
  customers: "M8.5 11.5a3.5 3.5 0 1 1 0-7a3.5 3.5 0 0 1 0 7Zm7 1a2.75 2.75 0 1 1 0-5.5a2.75 2.75 0 0 1 0 5.5ZM4.5 18.5v-1.25c0-2.5 2.2-4.5 4.9-4.5h1.2c2.7 0 4.9 2 4.9 4.5v1.25M14.6 13.75h1.2c1.85 0 3.4 1.35 3.4 3.1V18.5",
  records: "M6 4.5h8l4 4V19.5H6zM10 4.5V9h4.5",
  vehicles: "M5 15.5V10l2.5-3.5h9L19 10v5.5M7 15.5h10M7.5 15.5a1.5 1.5 0 1 0 0.01 0M16.5 15.5a1.5 1.5 0 1 0 0.01 0",
  services: "M5 8.5h14M5 12h10M5 15.5h8M14.5 6.5l1.5-1.5 2 2-1.5 1.5z",
  admins: "M8.5 11.5a3 3 0 1 1 0-6a3 3 0 0 1 0 6Zm7 1a2.25 2.25 0 1 1 0-4.5a2.25 2.25 0 0 1 0 4.5M13.5 18.5l2-2 1.5 1.5M16 14.5l1 1",
  profile: "M7.5 9.5a3 3 0 1 1 6 0a3 3 0 0 1-6 0ZM4.5 18.5c0-2.5 2.4-4.5 5.5-4.5h.5c3.1 0 5.5 2 5.5 4.5",
};

function NavIcon({ kind }: { kind: NavIconKind }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICON_PATHS[kind]} />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useAdminLanguage();
  const t = copy[language];
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <h2 className={styles.logo}>{t.logo}</h2>
          <p className={styles.logoSub}>Control center</p>
        </div>
        <div className={styles.topActions}>
          <ThemeToggleButton />
          <button
            type="button"
            className={styles.logoutButton}
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
          >
            Log out
          </button>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        {t.sections.map((section) => (
          <div key={section.label} className={styles.section}>
            <span className={styles.sectionLabel}>{section.label}</span>
            <div className={styles.sectionItems}>
              {section.items.map((item) => {
                const isActive =
                  item.path === "/"
                    ? pathname === "/"
                    : pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.link} ${isActive ? styles.active : ""}`}
                  >
                    <span className={styles.iconWrap}>
                      <NavIcon kind={item.icon} />
                    </span>
                    <span className={styles.linkText}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
