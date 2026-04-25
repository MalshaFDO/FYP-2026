"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar/sidebar";
import Header from "@/components/Header/header";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.content}>
        <Header />

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
