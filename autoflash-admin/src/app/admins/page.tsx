"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./admins.module.css";
import { loadAdminProfile } from "@/lib/adminProfile";

type AdminEntry = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
};

const STORAGE_KEY = "autoflash-admin-team";

const defaultTeam = (): AdminEntry[] => {
  const profile = loadAdminProfile();

  return [
    {
      id: "primary",
      name: profile.name,
      email: profile.email,
      status: "Active",
    },
    {
      id: "secondary",
      name: "Malsha Fernando",
      email: "fdoudugampola@gmail.com",
      status: "Active",
    },
  ];
};

const loadTeam = () => {
  if (typeof window === "undefined") return defaultTeam();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTeam();
    const parsed = JSON.parse(raw) as AdminEntry[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultTeam();
  } catch {
    return defaultTeam();
  }
};

const saveTeam = (team: AdminEntry[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
};

export default function AdminsPage() {
  const [team, setTeam] = useState<AdminEntry[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    setTeam(loadTeam());
  }, []);

  useEffect(() => {
    if (team.length) saveTeam(team);
  }, [team]);

  const filteredTeam = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return team.filter((admin) =>
      !normalized ? true : `${admin.name} ${admin.email}`.toLowerCase().includes(normalized)
    );
  }, [team, search]);

  const counts = useMemo(
    () => ({
      total: team.length,
      active: team.filter((item) => item.status === "Active").length,
    }),
    [team]
  );

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    const nextTeam = [
      ...team,
      {
        id: `${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        status: "Active" as const,
      },
    ];

    setTeam(nextTeam);
    setForm({ name: "", email: "" });
  };

  const removeAdmin = (id: string) => {
    const nextTeam = team.filter((admin) => admin.id !== id);
    setTeam(nextTeam);
  };

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.kicker}>System access</p>
          <h2>Manage Admins</h2>
          <p>Maintain the admin list, update contact details, and keep access visible in one panel.</p>
        </div>

        <div className={styles.actions}>
          <input
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins..."
          />
        </div>
      </section>

      <section className={styles.statsRow}>
        <article className={styles.statCard}>
          <span>All admins</span>
          <strong>{counts.total}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Active admins</span>
          <strong>{counts.active}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Access model</span>
          <strong>Admin only</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.tabsRow}>
          <div className={styles.tabs}>
            {[
              ["all", "All Admins"],
              ["active", "Active"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={styles.tabActive}
                disabled
              >
                {label}
              </button>
            ))}
          </div>
          <span className={styles.totalLabel}>{filteredTeam.length} total administrators</span>
        </div>

        <div className={styles.teamList}>
          <div className={styles.teamHead}>
            <span>Admin details</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredTeam.map((admin) => (
            <div key={admin.id} className={styles.teamRow}>
              <div>
                <strong>{admin.name}</strong>
                <div>{admin.email}</div>
              </div>
              <span className={styles.roleBadge}>{admin.status}</span>
              <button
                type="button"
                className={styles.deleteAction}
                onClick={() => removeAdmin(admin.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <form className={styles.addCard} onSubmit={handleAdd}>
          <div className={styles.addHeader}>
            <div>
              <p className={styles.kicker}>Quick add</p>
              <h3>Create admin access</h3>
            </div>
          </div>
          <div className={styles.formGrid}>
            <input
              className="admin-input"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="admin-input"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <button className="admin-button" type="submit">
              Add admin
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
