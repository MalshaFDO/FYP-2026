"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./services.module.css";
import {
  defaultServicePricingConfig,
  mapServicePricingConfig,
  type PricingRow,
  type ServicePricingConfig,
  type VehicleTypeKey,
} from "@/lib/servicePricingConfig";

type ServiceRecord = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type ServiceFormState = {
  name: string;
  category: string;
  description: string;
  price: number;
  active: boolean;
  sortOrder: number;
};

const emptyForm: ServiceFormState = {
  name: "",
  category: "General",
  description: "",
  price: 0,
  active: true,
  sortOrder: 0,
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

const money = new Intl.NumberFormat("en-LK", {
  maximumFractionDigits: 0,
});

const vehicleLabels: Record<VehicleTypeKey, string> = {
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Pickup",
  minivan: "MiniVan",
};

const bodywashRowOrder = ["quickWash", "bodywashVacuum", "washVacuumWax", "fullBodywash"] as const;

const bodywashRowTitles: Record<(typeof bodywashRowOrder)[number], string> = {
  quickWash: "Quick Wash",
  bodywashVacuum: "Bodywash & Vacuum",
  washVacuumWax: "Wash, Vacuum & WAX",
  fullBodywash: "Full Bodywash",
};

const bodywashAddonLabels = [
  ["leatherTreatment", "Leather Treatment"],
  ["rainX", "RainX"],
  ["tarRemoval", "Tar Removal"],
  ["headLightPolish", "Head Light Polish"],
] as const;

const bodywashAddonVehicleFields = ["engineWash", "underBodyWax"] as const;

const isAllZeroRow = (row: Partial<PricingRow> | undefined) =>
  !row || Object.values(row).every((value) => Number(value) === 0);

const normalizeBodywashConfig = (config: any) => ({
  ...config,
  bodywash: {
    sedan: isAllZeroRow(config?.bodywash?.sedan)
      ? defaultServicePricingConfig.bodywash.sedan
      : config?.bodywash?.sedan,
    suv: isAllZeroRow(config?.bodywash?.suv)
      ? defaultServicePricingConfig.bodywash.suv
      : config?.bodywash?.suv,
    pickup: isAllZeroRow(config?.bodywash?.pickup)
      ? defaultServicePricingConfig.bodywash.pickup
      : config?.bodywash?.pickup,
    minivan: isAllZeroRow(config?.bodywash?.minivan)
      ? defaultServicePricingConfig.bodywash.minivan
      : config?.bodywash?.minivan,
  },
});

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [pricingConfig, setPricingConfig] = useState<ServicePricingConfig>(defaultServicePricingConfig);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBodywashField, setEditingBodywashField] = useState<
    (typeof bodywashRowOrder)[number] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pricingMessage, setPricingMessage] = useState("");
  const [error, setError] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setPricingLoading(true);

        const [servicesRes, pricingRes] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }),
          fetch("/api/service-pricing", { cache: "no-store" }),
        ]);

        const servicesData = await parseJsonSafely(servicesRes);
        const pricingData = await parseJsonSafely(pricingRes);

        if (!servicesRes.ok || !servicesData?.success) {
          throw new Error(servicesData?.error || "Failed to load services");
        }

        if (!pricingRes.ok || !pricingData?.success) {
          throw new Error(pricingData?.error || "Failed to load bodywash pricing");
        }

        setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
        setPricingConfig(mapServicePricingConfig(normalizeBodywashConfig(pricingData.config)));
      } catch (err) {
        const text = err instanceof Error ? err.message : "Failed to load data";
        setError(text);
        setPricingError(text);
      } finally {
        setLoading(false);
        setPricingLoading(false);
      }
    };

    loadData();
  }, []);

  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services]
  );

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...services]
      .filter((service) => {
        if (!query) return true;
        return (
          service.name.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => {
        if (left.active !== right.active) return left.active ? -1 : 1;
        if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
        return left.name.localeCompare(right.name);
      });
  }, [search, services]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  const editService = (service: ServiceRecord) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      category: service.category || "General",
      description: service.description || "",
      price: Number(service.price || 0),
      active: Boolean(service.active),
      sortOrder: Number(service.sortOrder || 0),
    });
    setMessage("");
    setError("");
  };

  const refreshOne = (updated: ServiceRecord) => {
    setServices((current) =>
      current
        .map((service) => (service._id === updated._id ? updated : service))
        .sort((left, right) => {
          if (left.active !== right.active) return left.active ? -1 : 1;
          if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
          return left.name.localeCompare(right.name);
        })
    );
  };

  const submitService = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!form.name.trim()) {
        throw new Error("Service name is required");
      }

      const res = await fetch("/api/services", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save service");
      }

      const saved = data.service as ServiceRecord;

      if (editingId) {
        refreshOne(saved);
      } else {
        setServices((current) =>
          [saved, ...current].sort((left, right) => {
            if (left.active !== right.active) return left.active ? -1 : 1;
            if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
            return left.name.localeCompare(right.name);
          })
        );
      }

      setMessage(editingId ? "Service updated successfully." : "New service created successfully.");
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (service: ServiceRecord) => {
    const confirmed = window.confirm(`Delete ${service.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(service._id);
      setMessage("");
      setError("");

      const res = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service._id }),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to delete service");
      }

      setServices((current) => current.filter((item) => item._id !== service._id));
      if (editingId === service._id) {
        resetForm();
      }
      setMessage("Service deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (service: ServiceRecord) => {
    try {
      setMessage("");
      setError("");

      const next = { ...service, active: !service.active };
      const res = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service._id,
          name: next.name,
          category: next.category,
          description: next.description,
          price: next.price,
          active: next.active,
          sortOrder: next.sortOrder,
        }),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to update service");
      }

      refreshOne(data.service as ServiceRecord);
      setMessage(`${service.name} is now ${next.active ? "active" : "inactive"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
    }
  };

  const updateBodywash = (vehicle: VehicleTypeKey, field: keyof PricingRow, value: number) => {
    setPricingConfig((current) => ({
      ...current,
      bodywash: {
        ...current.bodywash,
        [vehicle]: {
          ...current.bodywash[vehicle],
          [field]: value,
        },
      },
    }));
  };

  const updateBodywashAddon = (field: keyof ServicePricingConfig["bodywashAddons"], value: number) => {
    setPricingConfig((current) => ({
      ...current,
      bodywashAddons: {
        ...current.bodywashAddons,
        [field]: value,
      },
    }));
  };

  const updateBodywashVehicleAddon = (
    field: "engineWash" | "underBodyWax",
    vehicle: VehicleTypeKey,
    value: number
  ) => {
    setPricingConfig((current) => ({
      ...current,
      bodywashAddons: {
        ...current.bodywashAddons,
        [field]: {
          ...current.bodywashAddons[field],
          [vehicle]: value,
        },
      },
    }));
  };

  const savePricing = async (closeAfterSave = false) => {
    try {
      setPricingSaving(true);
      setPricingMessage("");
      setPricingError("");

      const res = await fetch("/api/service-pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingConfig),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save bodywash pricing");
      }

      setPricingConfig(mapServicePricingConfig(normalizeBodywashConfig(data.config)));
      if (closeAfterSave) {
        setEditingBodywashField(null);
      }
      setPricingMessage("Bodywash prices updated successfully. Customer pages will use the new values.");
    } catch (err) {
      setPricingError(err instanceof Error ? err.message : "Failed to save bodywash pricing");
    } finally {
      setPricingSaving(false);
    }
  };

  const reloadPricing = async () => {
    try {
      setPricingLoading(true);
      setPricingMessage("");
      setPricingError("");

      const res = await fetch("/api/service-pricing", { cache: "no-store" });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to reload bodywash pricing");
      }

      setPricingConfig(mapServicePricingConfig(normalizeBodywashConfig(data.config)));
      setEditingBodywashField(null);
    } catch (err) {
      setPricingError(err instanceof Error ? err.message : "Failed to reload bodywash pricing");
    } finally {
      setPricingLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.kicker}>Services</p>
          <h2 className={styles.title}>Manage services and bodywash prices</h2>
          <p className={styles.copy}>
            Add new services, edit existing ones, and update the live bodywash pricing that the customer pages read from.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <span>Total services</span>
            <strong>{services.length}</strong>
          </div>
          <div>
            <span>Active services</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>{editingId ? "Edit service" : "Create service"}</h3>
            <p>Use this form to add a new service or update an existing one.</p>
          </div>
          {editingId && (
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Service name</span>
            <input
              className={styles.input}
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Bodywash Premium"
            />
          </label>

          <label className={styles.field}>
            <span>Category</span>
            <input
              className={styles.input}
              type="text"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Bodywash, Full Service, Add-on..."
            />
          </label>

          <label className={styles.field}>
            <span>Price</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: Number(event.target.value) || 0 }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Sort order</span>
            <input
              className={styles.input}
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))
              }
            />
          </label>

          <label className={styles.fieldWide}>
            <span>Description</span>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Short note for the admin team or customers"
              rows={4}
            />
          </label>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            <span>Active</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="admin-button"
            onClick={submitService}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : editingId ? "Update service" : "Create service"}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={resetForm}>
            Clear form
          </button>
          {message && <span className={styles.success}>{message}</span>}
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Service catalog</h3>
            <p>Search, edit, activate, or remove any service here.</p>
          </div>
          <label className={styles.searchWrap}>
            <span>Search</span>
            <input
              className={styles.input}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, category, or description"
            />
          </label>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className={styles.emptyState}>
            {search.trim()
              ? "No services match your search."
              : "No services yet. Create the first one above."}
          </div>
        ) : (
          <div className={styles.serviceGrid}>
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className={`${styles.serviceCard} ${!service.active ? styles.inactive : ""}`}
              >
                <div className={styles.serviceHead}>
                  <div>
                    <p className={styles.serviceCategory}>{service.category || "General"}</p>
                    <h4>{service.name}</h4>
                  </div>
                  <span className={service.active ? styles.activePill : styles.inactivePill}>
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className={styles.serviceDescription}>
                  {service.description || "No description provided."}
                </p>

                <div className={styles.serviceMeta}>
                  <div>
                    <span>Price</span>
                    <strong>{money.format(service.price || 0)}</strong>
                  </div>
                  <div>
                    <span>Sort order</span>
                    <strong>{service.sortOrder}</strong>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button type="button" className={styles.cardButton} onClick={() => editService(service)}>
                    Edit
                  </button>
                  <button type="button" className={styles.cardButton} onClick={() => toggleActive(service)}>
                    {service.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.cardButton} ${styles.dangerButton}`}
                    onClick={() => deleteService(service)}
                    disabled={deletingId === service._id}
                  >
                    {deletingId === service._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Bodywash pricing</h3>
            <p>Edit the prices shown on the customer bodywash booking pages. Save here to update the shared pricing source.</p>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={reloadPricing} disabled={pricingLoading}>
            {pricingLoading ? "Reloading..." : "Reload current prices"}
          </button>
        </div>

        <div className={styles.bodywashGrid}>
          {bodywashRowOrder.map((field) => (
            <article key={field} className={styles.pricingCard}>
              <div className={styles.pricingCardHeader}>
                <div>
                  <p className={styles.serviceCategory}>Bodywash</p>
                  <h4>{bodywashRowTitles[field]}</h4>
                </div>
                <button
                  type="button"
                  className={styles.cardButton}
                  onClick={
                    editingBodywashField === field
                      ? () => savePricing(true)
                      : () => setEditingBodywashField(field)
                  }
                >
                  {editingBodywashField === field ? "Save & Close" : "Edit"}
                </button>
              </div>

              {editingBodywashField === field ? (
                <div className={styles.pricingEditor}>
                  {Object.entries(vehicleLabels).map(([vehicleKey, vehicleLabel]) => (
                    <label key={`${field}-${vehicleKey}`} className={styles.field}>
                      <span>{vehicleLabel}</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        value={pricingConfig.bodywash[vehicleKey as VehicleTypeKey][field]}
                        onChange={(event) =>
                          updateBodywash(
                            vehicleKey as VehicleTypeKey,
                            field,
                            Number(event.target.value) || 0
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className={styles.pricingSummary}>
                  {Object.entries(vehicleLabels).map(([vehicleKey, vehicleLabel]) => (
                    <div key={`${field}-${vehicleKey}`}>
                      <span>{vehicleLabel}</span>
                      <strong>
                        {money.format(pricingConfig.bodywash[vehicleKey as VehicleTypeKey][field] || 0)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className={styles.panelSeparator} />

        <div className={styles.panelHeader}>
          <div>
            <h3>Bodywash add-ons</h3>
            <p>These values also flow into the customer booking page pricing.</p>
          </div>
        </div>

        <div className={styles.sharedGrid}>
          {bodywashAddonLabels.map(([field, label]) => (
            <label key={field} className={styles.fieldRow}>
              <span>{label}</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={pricingConfig.bodywashAddons[field]}
                onChange={(event) => updateBodywashAddon(field, Number(event.target.value) || 0)}
              />
            </label>
          ))}
        </div>

        <div className={styles.fullGrid} style={{ marginTop: "16px" }}>
          {bodywashAddonVehicleFields.map((field) => (
            <article key={field} className={styles.vehiclePanel}>
              <h4>{field === "engineWash" ? "Engine Wash" : "Under Body Wax"}</h4>
              <div className={styles.vehicleFields}>
                {Object.entries(vehicleLabels).map(([vehicleKey, vehicleLabel]) => (
                  <label key={`${field}-${vehicleKey}`} className={styles.fieldRow}>
                    <span>{vehicleLabel}</span>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      value={pricingConfig.bodywashAddons[field][vehicleKey as VehicleTypeKey]}
                      onChange={(event) =>
                        updateBodywashVehicleAddon(
                          field,
                          vehicleKey as VehicleTypeKey,
                          Number(event.target.value) || 0
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="admin-button"
            onClick={() => savePricing(false)}
            disabled={pricingSaving || pricingLoading}
          >
            {pricingSaving ? "Saving..." : "Save bodywash prices"}
          </button>
          {pricingMessage && <span className={styles.success}>{pricingMessage}</span>}
          {pricingError && <span className={styles.error}>{pricingError}</span>}
        </div>
      </section>
    </div>
  );
}
