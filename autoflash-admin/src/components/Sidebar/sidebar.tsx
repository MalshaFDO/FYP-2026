"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./sidebar.module.css";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Bookings", path: "/bookings" },
    { name: "Calendar", path: "/calendar" },
    { name: "Customers", path: "/customers" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Services", path: "/services" },
    { name: "Payments", path: "/payments" },
  ];

  const router = useRouter();

const handleLogout = async () => {
  await signOut(auth);
  router.push("/login");
};

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>AutoFlash Admin</h2>

      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.link} ${
              pathname === item.path ? styles.active : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <button
  onClick={handleLogout}
  className={styles.logoutBtn}
>
  Logout
</button>
    </div>
  );
}
