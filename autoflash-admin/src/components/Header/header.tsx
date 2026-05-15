"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./header.module.css";
import { DEFAULT_ADMIN_PROFILE, loadAdminProfile } from "@/lib/adminProfile";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/customers": "Customers",
  "/admins": "Manage Admins",
  "/profile": "Admin Account Settings",
  "/payments": "Pending Payments",
  "/calendar": "Calendar",
  "/record-books": "Record Books",
  "/vehicles": "Vehicles",
  "/services": "Services",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_ADMIN_PROFILE);

  useEffect(() => {
    setProfile(loadAdminProfile());
  }, []);

  const avatarLabel = useMemo(
    () => profile.name.trim().charAt(0).toUpperCase() || "A",
    [profile.name]
  );

  return (
    <header className={styles.header}>
      <div className={styles.center}>
        <span className={styles.titleCopy}>Current page</span>
        <h1>{titles[pathname] || "Admin Panel"}</h1>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.profile}
          onClick={() => router.push("/profile")}
        >
          <div className={styles.info}>
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.role}>{profile.email}</span>
          </div>
          <div className={styles.avatar} aria-hidden="true">
            {avatarLabel}
          </div>
        </button>
      </div>
    </header>
  );
}
