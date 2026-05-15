"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./profile.module.css";
import {
  AdminProfile,
  DEFAULT_ADMIN_PROFILE,
  getAdminInitial,
  loadAdminProfile,
  saveAdminProfile,
} from "@/lib/adminProfile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadAdminProfile());
  }, []);

  const avatar = useMemo(() => getAdminInitial(profile.name), [profile.name]);

  const updateField = <K extends keyof AdminProfile>(field: K, value: AdminProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveAdminProfile(profile);
    setSaved(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <div className={styles.heroIdentity}>
          <div className={styles.avatar}>{avatar}</div>
          <div>
            <p className={styles.kicker}>Admin profile</p>
            <h2>{profile.name}</h2>
            <div className={styles.metaRow}>
              <span className={styles.roleBadge}>Admin</span>
              <span className={styles.emailBadge}>{profile.email}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroMeta}>
          <article>
            <span>Role</span>
            <strong>Admin</strong>
          </article>
          <article>
            <span>Contact</span>
            <strong>{profile.phone}</strong>
          </article>
          <article>
            <span>Location</span>
            <strong>{profile.location}</strong>
          </article>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.kicker}>Personal details</p>
            <h3>Edit name and contact info</h3>
          </div>

          <p className={styles.copy}>
            Keep the profile card and admin header in sync by updating this record. Changes are stored locally in this browser.
          </p>

          <div className={styles.formGrid}>
            <label>
              <span>Full name</span>
              <input
                className="admin-input"
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                className="admin-input"
                value={profile.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </label>
            <label>
              <span>Phone number</span>
              <input
                className="admin-input"
                value={profile.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </label>
            <label>
              <span>Title</span>
              <input
                className="admin-input"
                value={profile.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </label>
            <label>
              <span>Location</span>
              <input
                className="admin-input"
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </label>
            <label className={styles.fullWidth}>
              <span>Bio</span>
              <textarea
                className="admin-textarea"
                rows={4}
                value={profile.bio}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className="admin-button" onClick={handleSave}>
              Save changes
            </button>
            <span className={saved ? styles.saved : styles.muted}>
              {saved ? "Profile saved locally." : "Changes save to this browser."}
            </span>
          </div>
        </article>

        <div className={styles.sideStack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <p className={styles.kicker}>Access</p>
              <h3>Admin account</h3>
            </div>
            <div className={styles.accessList}>
              <div>
                <span>Access level</span>
                <strong>Admin</strong>
              </div>
              <div>
                <span>Profile status</span>
                <strong className={styles.green}>Active &amp; Verified</strong>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <p className={styles.kicker}>Support</p>
              <h3>Need a reset?</h3>
            </div>
            <p className={styles.copy}>
              Password resets should be handled through the admin email address. This keeps the workflow visible and easy to audit.
            </p>
            <button type="button" className="admin-button">
              Send reset link
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
