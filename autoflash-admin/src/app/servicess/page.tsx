"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./services.module.css";
import {
  defaultServicePricingConfig,
  mapServicePricingConfig,
  type ServicePricingConfig,
  type PricingRow,
  type VehicleTypeKey,
} from "@/lib/servicePricingConfig";

const parseJsonSafely = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const vehicleLabels: Record<VehicleTypeKey, string> = {
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Pickup",
  minivan: "MiniVan",
};
const vehicleKeys = Object.keys(vehicleLabels) as VehicleTypeKey[];

const rowTitle: Record<string, string> = {
  quickWash: "Quick Wash",
  bodywashVacuum: "Bodywash & Vacuum",
  washVacuumWax: "Wash, Vacuum & WAX",
  fullBodywash: "Full Bodywash",
  fullService: "Full Service",
  engineWash: "Engine Wash",
  brakeService: "Brake Service",
  oilChange: "Oil Change",
  oilFilter: "Oil Filter",
  underBodyWash: "Under Body Wash",
  windowWasher: "Window Washer Fluid",
  caliperGrease: "Caliper Grease",
  brakeCaliperLube: "Brake Caliper Lube",
  brakeDrumCleaning: "Brake Drum Cleaning",
  sumpWasher: "Sump Washer",
  chemicalCost: "Chemical Cost",
  rexine: "Rexine",
  interiorFumigation: "Interior Fumigation",
  n2: "Nitrogen (N2)",
  serviceCharge: "Service Charge",
};

const rowOrder = ["quickWash", "bodywashVacuum", "washVacuumWax", "fullBodywash"] as const;
const fullOrder = [
  "fullService",
  "engineWash",
  "brakeService",
  "oilChange",
  "oilFilter",
  "underBodyWash",
  "windowWasher",
  "caliperGrease",
  "brakeCaliperLube",
  "brakeDrumCleaning",
  "sumpWasher",
  "chemicalCost",
  "rexine",
  "interiorFumigation",
  "n2",
  "serviceCharge",
] as const;

const extraVehicleKeys = vehicleKeys;

const bodywashAddonLabels = [
  ["leatherTreatment", "Leather Treatment"],
  ["rainX", "RainX"],
  ["tarRemoval", "Tar Removal"],
  ["headLightPolish", "Head Light Polish"],
] as const;

const fullServiceAddonLabels = [
  ["wheelAlignment", "Wheel Alignment"],
  ["brakeFluid", "Brake Fluid"],
  ["coolantFlush", "Coolant Flush"],
  ["batteryHealth", "Battery Health"],
  ["tireRotation", "Tire Rotation"],
] as const;

export default function ServicesPage() {
  const [config, setConfig] = useState<ServicePricingConfig>(defaultServicePricingConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/service-pricing", { cache: "no-store" });
        const data = await parseJsonSafely(res);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load service pricing");
        }

        setConfig(mapServicePricingConfig(data.config));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service pricing");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateBodywash = (vehicle: VehicleTypeKey, field: keyof PricingRow, value: number) => {
    setConfig((current) => ({
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

  const updateFullService = (vehicle: VehicleTypeKey, field: keyof PricingRow, value: number) => {
    setConfig((current) => ({
      ...current,
      fullService: {
        ...current.fullService,
        [vehicle]: {
          ...current.fullService[vehicle],
          [field]: value,
        },
      },
    }));
  };

  const updateBodywashAddon = (field: keyof ServicePricingConfig["bodywashAddons"], value: number) => {
    setConfig((current) => ({
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
    setConfig((current) => ({
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

  const updateFullServiceAddon = (field: keyof ServicePricingConfig["fullServiceAddons"], value: number) => {
    setConfig((current) => ({
      ...current,
      fullServiceAddons: {
        ...current.fullServiceAddons,
        [field]: value,
      },
    }));
  };

  const updateFullServiceVehicleAddon = (
    field:
      | "engineWash"
      | "quickWash"
      | "bodywashVacuum"
      | "washVacuumWax"
      | "fullBodywash",
    vehicle: VehicleTypeKey,
    value: number
  ) => {
    setConfig((current) => ({
      ...current,
      fullServiceAddons: {
        ...current.fullServiceAddons,
        [field]: {
          ...current.fullServiceAddons[field],
          [vehicle]: value,
        },
      },
    }));
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch("/api/service-pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await parseJsonSafely(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save service pricing");
      }

      setConfig(mapServicePricingConfig(data.config));
      setMessage("Service prices updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service pricing");
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => setConfig(defaultServicePricingConfig);

  const renderedBodywashRows = useMemo(
    () => rowOrder.map((field) => ({ field, title: rowTitle[field] })),
    []
  );

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.kicker}>Services</p>
          <h2 className={styles.title}>Update service prices</h2>
          <p className={styles.copy}>
            Change bodywash, full service, oil filter, and related service prices here. Those values flow into the customer booking pages.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <span>Editable vehicle types</span>
            <strong>4</strong>
          </div>
          <div>
            <span>Pricing groups</span>
            <strong>2</strong>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Bodywash pricing</h3>
            <p>Example: update Sedan quick wash or full bodywash here.</p>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={resetConfig}>
            Reset defaults
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service</th>
                {Object.entries(vehicleLabels).map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderedBodywashRows.map(({ field, title }) => (
                <tr key={field}>
                  <td>{title}</td>
                {vehicleKeys.map((vehicle) => (
                  <td key={`${field}-${vehicle}`}>
                    <input
                      className={styles.priceInput}
                      type="number"
                      value={config.bodywash[vehicle][field as keyof PricingRow]}
                      onChange={(event) =>
                        updateBodywash(
                          vehicle,
                          field as keyof PricingRow,
                          Number(event.target.value)
                        )
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Bodywash add-ons</h3>
            <p>Update extra prices used on the bodywash booking page.</p>
          </div>
        </div>

        <div className={styles.sharedGrid}>
          {bodywashAddonLabels.map(([field, label]) => (
            <label key={field} className={styles.fieldRow}>
              <span>{label}</span>
              <input
                className={styles.priceInput}
                type="number"
                value={config.bodywashAddons[field]}
                onChange={(event) => updateBodywashAddon(field, Number(event.target.value))}
              />
            </label>
          ))}
        </div>

        <div className={styles.fullGrid} style={{ marginTop: "16px" }}>
          {["engineWash", "underBodyWax"].map((field) => (
            <article key={field} className={styles.vehiclePanel}>
              <h4>{field === "engineWash" ? "Engine Wash" : "Under Body Wax"}</h4>
              <div className={styles.vehicleFields}>
                {extraVehicleKeys.map((vehicle) => (
                  <label key={`${field}-${vehicle}`} className={styles.fieldRow}>
                    <span>{vehicleLabels[vehicle]}</span>
                    <input
                      className={styles.priceInput}
                      type="number"
                      value={config.bodywashAddons[field as "engineWash" | "underBodyWax"][vehicle]}
                      onChange={(event) =>
                        updateBodywashVehicleAddon(
                          field as "engineWash" | "underBodyWax",
                          vehicle,
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Full service and oil pricing</h3>
            <p>Update the shared service amounts used in customer quotations.</p>
          </div>
        </div>

        <div className={styles.fullGrid}>
          {vehicleKeys.map((vehicle) => (
            <article key={vehicle} className={styles.vehiclePanel}>
              <h4>{vehicleLabels[vehicle]}</h4>
                <div className={styles.vehicleFields}>
                  {fullOrder.map((field) => (
                    <label key={`${vehicle}-${field}`} className={styles.fieldRow}>
                      <span>{rowTitle[field]}</span>
                      <input
                        className={styles.priceInput}
                        type="number"
                      value={config.fullService[vehicle][field as keyof PricingRow]}
                        onChange={(event) =>
                          updateFullService(
                          vehicle,
                          field as keyof PricingRow,
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Full service add-ons</h3>
            <p>Update the extra service prices used in the full-service quotation flow.</p>
          </div>
        </div>

        <div className={styles.sharedGrid}>
          {fullServiceAddonLabels.map(([field, label]) => (
            <label key={field} className={styles.fieldRow}>
              <span>{label}</span>
              <input
                className={styles.priceInput}
                type="number"
                value={config.fullServiceAddons[field]}
                onChange={(event) => updateFullServiceAddon(field, Number(event.target.value))}
              />
            </label>
          ))}
        </div>

        <div className={styles.fullGrid} style={{ marginTop: "16px" }}>
          {(["engineWash", "quickWash", "bodywashVacuum", "washVacuumWax", "fullBodywash"] as const).map((field) => (
            <article key={field} className={styles.vehiclePanel}>
              <h4>{rowTitle[field]}</h4>
              <div className={styles.vehicleFields}>
                {extraVehicleKeys.map((vehicle) => (
                  <label key={`${field}-${vehicle}`} className={styles.fieldRow}>
                    <span>{vehicleLabels[vehicle]}</span>
                    <input
                      className={styles.priceInput}
                      type="number"
                      value={config.fullServiceAddons[field][vehicle]}
                      onChange={(event) =>
                        updateFullServiceVehicleAddon(
                          field,
                          vehicle,
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Shared quote values</h3>
            <p>Edit the oil filter and service charge used in quotation totals.</p>
          </div>
        </div>

        <div className={styles.sharedGrid}>
          <label className={styles.fieldRow}>
            <span>Oil Filter</span>
            <input
              className={styles.priceInput}
              type="number"
              value={config.quote.oilFilter}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  quote: { ...current.quote, oilFilter: Number(event.target.value) },
                }))
              }
            />
          </label>
          <label className={styles.fieldRow}>
            <span>Service Charge</span>
            <input
              className={styles.priceInput}
              type="number"
              value={config.quote.serviceCharge}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  quote: { ...current.quote, serviceCharge: Number(event.target.value) },
                }))
              }
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className="admin-button" onClick={saveConfig} disabled={saving || loading}>
            {saving ? "Saving..." : "Save service prices"}
          </button>
          {message && <span className={styles.success}>{message}</span>}
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </section>
    </div>
  );
}
