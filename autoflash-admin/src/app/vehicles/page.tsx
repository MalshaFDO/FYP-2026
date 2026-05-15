"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./vehicles.module.css";

type VehicleCatalogEntry = {
  _id: string;
  category: string;
  make: string;
  model: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
};

type FormState = {
  id?: string;
  category: string;
  make: string;
  model: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
};

const emptyForm = (): FormState => ({
  category: "Sedan",
  make: "",
  model: "",
  imageUrl: "",
  sortOrder: 0,
  active: true,
});

const parseJsonSafely = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

export default function VehiclesPage() {
  const [entries, setEntries] = useState<VehicleCatalogEntry[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicle-catalog", { cache: "no-store" });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load vehicle catalog");
      }

      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicle catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return entries;

    return entries.filter((entry) =>
      [entry.category, entry.make, entry.model].join(" ").toLowerCase().includes(normalized)
    );
  }, [entries, search]);

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, imageUrl: dataUrl }));
  };

  const resetForm = () => setForm(emptyForm());

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch("/api/vehicle-catalog", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save vehicle");
      }

      setMessage("Vehicle saved successfully.");
      resetForm();
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle catalog item?")) return;

    try {
      setError("");
      setMessage("");
      const res = await fetch("/api/vehicle-catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await parseJsonSafely(res);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to delete vehicle");
      }
      setMessage("Vehicle removed.");
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vehicle");
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.kicker}>Admin Vehicles</p>
          <h2 className={styles.title}>Vehicle Catalog</h2>
          <p className={styles.copy}>
            Add vehicle categories, makes, models, and an image that will appear on the customer booking pages.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <span>Catalog entries</span>
            <strong>{entries.length}</strong>
          </div>
          <div>
            <span>Visible</span>
            <strong>{entries.filter((entry) => entry.active).length}</strong>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>{form.id ? "Edit vehicle" : "Add vehicle"}</h3>
            <p>Make changes here and the customer booking pages will pick them up from the shared catalog.</p>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={resetForm}>
            Clear form
          </button>
        </div>

        <div className={styles.formGrid}>
          <label>
            <span>Category</span>
            <input
              className="admin-input"
              value={form.category}
              onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
              placeholder="Sedan"
            />
          </label>
          <label>
            <span>Make</span>
            <input
              className="admin-input"
              value={form.make}
              onChange={(e) => setForm((current) => ({ ...current, make: e.target.value }))}
              placeholder="Toyota"
            />
          </label>
          <label>
            <span>Model</span>
            <input
              className="admin-input"
              value={form.model}
              onChange={(e) => setForm((current) => ({ ...current, model: e.target.value }))}
              placeholder="Axio"
            />
          </label>
          <label>
            <span>Sort order</span>
            <input
              className="admin-input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </label>
        </div>

        <div className={styles.uploadRow}>
          <label className={styles.uploadBox}>
            <span>Vehicle image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0] || undefined)}
            />
          </label>

          <label className={styles.previewBox}>
            <span>Preview</span>
            <div className={styles.imagePreview}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt={`${form.make} ${form.model}`} />
              ) : (
                <div className={styles.placeholder}>Upload a vehicle image</div>
              )}
            </div>
          </label>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))}
          />
          <span>Visible on customer booking pages</span>
        </label>

        <div className={styles.formActions}>
          <button type="button" className="admin-button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : form.id ? "Update vehicle" : "Save vehicle"}
          </button>
        </div>

        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section className={styles.panel}>
        <div className={styles.listHeader}>
          <div>
            <h3>Catalog list</h3>
            <p>Edit the shared catalog, then refresh the booking pages to see the change.</p>
          </div>
          <input
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, make, or model..."
          />
        </div>

        {loading ? (
          <p className={styles.muted}>Loading vehicles...</p>
        ) : filteredEntries.length === 0 ? (
          <p className={styles.muted}>No vehicle catalog entries found.</p>
        ) : (
          <div className={styles.cards}>
            {filteredEntries.map((entry) => (
              <article key={entry._id} className={styles.vehicleCard}>
                <div className={styles.vehicleImage}>
                  {entry.imageUrl ? <img src={entry.imageUrl} alt={`${entry.make} ${entry.model}`} /> : <span>No image</span>}
                </div>
                <div className={styles.vehicleBody}>
                  <div className={styles.vehicleMeta}>
                    <span>{entry.category}</span>
                    <strong>{entry.make} {entry.model}</strong>
                  </div>
                  <div className={styles.vehicleActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() =>
                        setForm({
                          id: entry._id,
                          category: entry.category,
                          make: entry.make,
                          model: entry.model,
                          imageUrl: entry.imageUrl,
                          sortOrder: entry.sortOrder,
                          active: entry.active,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => handleDelete(entry._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
