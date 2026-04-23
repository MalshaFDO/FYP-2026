"use client";

import { useEffect, useState } from "react";
import styles from "./RecordBooksPage.module.css";

type PerformedService = {
  name: string;
  status: "R" | "T" | "C" | "YES" | "NO" | "";
};

type RecordEntry = {
  isEditing?: boolean;
  serviceDate: string;
  odometer: string;
  invoiceNumber: string;
  services: PerformedService[];
  engineOil: { make: string; type: string };
  transOil: { make: string; type: string };
  diffOil: { make: string };
  transferOil: { type: string };
  pSteering: { make: string; type: string };
  brakeFluid: { make: string; type: string };
  nextServiceDate: string;
  nextServiceKM: string;
  technician: string;
  notes: string;
};

const parseJsonResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      res.ok
        ? "The server returned an unexpected response."
        : `Request failed with status ${res.status}.`
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("The server returned invalid JSON.");
  }
};

const serviceCategories = {
  "Other Service": ["Injector Cleaning", "A/C Cleaning", "Detailing", "Tune-up", "Engine Flush"],
  Filters: ["Oil Filter", "Fuel Filter", "A/C Filter", "Air Filter", "Wiper Blades"],
  "Health Check": [
    "Tyre Rotation",
    "Tyre Pressure",
    "Brake Liners",
    "Brake Pads",
    "Drive Belts",
    "Battery Fluid",
    "Radiator",
    "Drive Shaft Boots",
    "St. Rack Boot",
    "Lamps",
  ],
  "Oil / Fluids": [
    "Engine Oil",
    "Transmission",
    "Differential",
    "Brake Fluid",
    "Clutch Fluid",
    "P.S. Fluid",
    "Coolant",
    "Win. Washing",
  ],
  Misc: ["Engine Wash", "HV Battery Blower Cleaning"],
};

const allServiceNames = Object.values(serviceCategories).flat();

const normalizeServiceName = (value?: string) =>
  (value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");

const checkboxOnlyServices = new Set(
  ["Detailing", "Engine Flush", "Tune-up", "Wiper Blades", "Engine Wash"].map((name) =>
    normalizeServiceName(name)
  )
);

const isCheckboxService = (serviceName: string) =>
  checkboxOnlyServices.has(normalizeServiceName(serviceName));

const getServiceControlOptions = (serviceName: string): Array<PerformedService["status"]> =>
  isCheckboxService(serviceName) ? ["YES", "NO"] : ["R", "T", "C"];

const getStatusLabel = (status: PerformedService["status"]) => {
  if (status === "YES") return "✓";
  if (status === "NO") return "✕";
  return status;
};

const createServicesFromSavedRecord = (
  performedServices: string[] = [],
  serviceStatuses: Array<{ name?: string; status?: string }> = []
): PerformedService[] => {
  const statusLookup = new Map(
    serviceStatuses
      .filter(
        (service): service is { name: string; status: string } =>
          typeof service?.name === "string" && typeof service?.status === "string"
      )
      .map((service) => [
        normalizeServiceName(service.name),
        service.status.trim().toUpperCase() as PerformedService["status"],
      ])
  );

  const legacyPerformedLookup = new Set(
    performedServices.map((service) => normalizeServiceName(service))
  );

  return allServiceNames.map((name) => ({
    name,
    status:
      statusLookup.get(normalizeServiceName(name)) ||
      (legacyPerformedLookup.has(normalizeServiceName(name))
        ? isCheckboxService(name)
          ? "YES"
          : "C"
        : ""),
  }));
};

const emptyRecord = (): RecordEntry => ({
  isEditing: true,
  serviceDate: new Date().toISOString().split("T")[0],
  odometer: "",
  invoiceNumber: "",
  services: allServiceNames.map((name) => ({ name, status: "" })),
  engineOil: { make: "", type: "" },
  transOil: { make: "", type: "" },
  diffOil: { make: "" },
  transferOil: { type: "" },
  pSteering: { make: "", type: "" },
  brakeFluid: { make: "", type: "" },
  nextServiceDate: "",
  nextServiceKM: "",
  technician: "",
  notes: "",
});

const serializeRecordForSave = (record: RecordEntry) => {
  const serviceStatuses = record.services
    .filter((service) => service.status)
    .map((service) => ({
      name: service.name,
      status: service.status,
    }));

  return {
    serviceDate: record.serviceDate,
    odometer: record.odometer,
    invoiceNumber: record.invoiceNumber,
    performedServices: serviceStatuses
      .filter((service) => service.status !== "NO")
      .map((service) => service.name),
    serviceStatuses,
    engineOil: record.engineOil,
    transOil: record.transOil,
    diffOil: record.diffOil,
    transferOil: record.transferOil,
    pSteering: record.pSteering,
    brakeFluid: record.brakeFluid,
    nextServiceDate: record.nextServiceDate,
    nextServiceKM: record.nextServiceKM,
    technician: record.technician,
    notes: record.notes,
  };
};

const mapBookRecordsToForm = (book: any): RecordEntry[] => {
  if (!Array.isArray(book?.records) || book.records.length === 0) {
    return [emptyRecord()];
  }

  return book.records.map((record: any) => ({
    serviceDate: record?.serviceDate || record?.date || "",
    odometer: record?.odometer?.toString?.() || "",
    invoiceNumber: record?.invoiceNumber || "",
    services: createServicesFromSavedRecord(
      record?.performedServices,
      record?.serviceStatuses
    ),
    engineOil: {
      make: record?.engineOil?.make || "",
      type: record?.engineOil?.type || "",
    },
    transOil: {
      make: record?.transOil?.make || "",
      type: record?.transOil?.type || "",
    },
    diffOil: {
      make: record?.diffOil?.make || "",
    },
    transferOil: {
      type: record?.transferOil?.type || "",
    },
    pSteering: {
      make: record?.pSteering?.make || "",
      type: record?.pSteering?.type || "",
    },
    brakeFluid: {
      make: record?.brakeFluid?.make || "",
      type: record?.brakeFluid?.type || "",
    },
    nextServiceDate: record?.nextServiceDate || "",
    nextServiceKM: record?.nextServiceKM?.toString?.() || "",
    technician: record?.technician || "",
    notes: record?.notes || "",
    isEditing: false,
  }));
};

const fillFromSources = (book: any, bookingMatch: any) => {
  const resolvedVehicleNumber =
    book?.vehicleNumber ||
    bookingMatch?.vehicleNumber ||
    "";
  const resolvedOwnerName =
    book?.ownerName ||
    bookingMatch?.customerName ||
    "";
  const resolvedVehicleModel =
    book?.vehicleModel ||
    bookingMatch?.vehicleModel ||
    bookingMatch?.vehicle ||
    "";
  const resolvedPhone =
    book?.phone ||
    bookingMatch?.mobile ||
    "";

  return {
    vehicleNumber: resolvedVehicleNumber,
    ownerName: resolvedOwnerName,
    vehicleModel: resolvedVehicleModel,
    phone: resolvedPhone,
  };
};

export default function RecordBooksPage() {
  const [searchValue, setSearchValue] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [phone, setPhone] = useState("");
  const [records, setRecords] = useState<RecordEntry[]>([emptyRecord()]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recordBookEnabled, setRecordBookEnabled] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(true);
  const [featureSaving, setFeatureSaving] = useState(false);

  useEffect(() => {
    const loadFeatureSetting = async () => {
      try {
        setFeatureLoading(true);

        const res = await fetch("/api/feature-settings/e-record-book", {
          cache: "no-store",
        });
        const data = await parseJsonResponse(res);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load e-record book status");
        }

        setRecordBookEnabled(Boolean(data.enabled));
      } catch (error: any) {
        console.error(error);
        setMessage(error?.message || "Failed to load e-record book status");
      } finally {
        setFeatureLoading(false);
      }
    };

    loadFeatureSetting();
  }, []);

  const handleFeatureToggle = async () => {
    const nextEnabled = !recordBookEnabled;

    try {
      setFeatureSaving(true);
      setMessage("");

      const res = await fetch("/api/feature-settings/e-record-book", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = await parseJsonResponse(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to update e-record book status");
      }

      setRecordBookEnabled(Boolean(data.enabled));
      setMessage(
        data.enabled
          ? "E-record book is now visible to users."
          : "E-record book is now hidden from users."
      );
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Failed to update e-record book status");
    } finally {
      setFeatureSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/recordbooks?vehicleNumber=${encodeURIComponent(searchValue)}`);
      const data = await parseJsonResponse(res);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load record book");
      }

      if (data.book) {
        const nextValues = fillFromSources(data.book, data.bookingMatch);

        setVehicleNumber(nextValues.vehicleNumber);
        setOwnerName(nextValues.ownerName);
        setVehicleModel(nextValues.vehicleModel);
        setPhone(nextValues.phone);
        setRecords(mapBookRecordsToForm(data.book));
      } else if (data.bookingMatch) {
        const nextValues = fillFromSources(null, data.bookingMatch);

        setVehicleNumber(nextValues.vehicleNumber);
        setOwnerName(nextValues.ownerName);
        setVehicleModel(nextValues.vehicleModel);
        setPhone(nextValues.phone);
        setRecords([emptyRecord()]);
        setMessage("No saved record book found. Booking details were loaded so you can create one.");
      } else {
        setVehicleNumber("");
        setOwnerName("");
        setVehicleModel("");
        setPhone("");
        setRecords([emptyRecord()]);
        setMessage("No record book found for that vehicle.");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Failed to load record book");
    } finally {
      setLoading(false);
    }
  };

  const updateRecordField = (index: number, field: keyof RecordEntry, value: any) => {
    setRecords((prev) =>
      prev.map((record, recordIndex) =>
        recordIndex === index ? { ...record, [field]: value } : record
      )
    );
  };

  const toggleEdit = (index: number) => {
    updateRecordField(index, "isEditing", !records[index].isEditing);
  };

  const removeRecord = (index: number) => {
    setRecords((prev) => {
      const next = prev.filter((_, recordIndex) => recordIndex !== index);
      return next.length > 0 ? next : [emptyRecord()];
    });
  };

  const calculateNextKM = (index: number) => {
    const current = parseInt(records[index].odometer.replace(/\D/g, ""), 10);
    if (!Number.isNaN(current)) {
      updateRecordField(index, "nextServiceKM", String(current + 5000));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/recordbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber,
          ownerName,
          vehicleModel,
          phone,
          records: records.map(serializeRecordForSave),
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save record book");
      }

      setMessage("Saved successfully.");
      if (data.book) {
        setVehicleNumber(data.book.vehicleNumber || "");
        setOwnerName(data.book.ownerName || "");
        setVehicleModel(data.book.vehicleModel || "");
        setPhone(data.book.phone || "");
        setRecords(mapBookRecordsToForm(data.book));
      } else {
        setRecords((prev) => prev.map((record) => ({ ...record, isEditing: false })));
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Failed to save record book");
    } finally {
      setLoading(false);
    }
  };

  const renderLabeledField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    disabled: boolean,
    extraProps?: { type?: string; className?: string }
  ) => (
    <label className={styles.floatingField}>
      <span className={styles.floatingLabel}>{label}</span>
      <input
        type={extraProps?.type || "text"}
        className={`${styles.field} ${styles.floatingInput} ${extraProps?.className || ""}`.trim()}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );

  return (
    <div className={styles.container}>
      <section className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <p className={styles.headerEyebrow}>Admin Record Book</p>
            <h2>Vehicle Lube Service Record</h2>
            <p className={styles.headerNote}>
              Search by vehicle number to load and update the latest service entries.
            </p>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleFeatureToggle}
                disabled={featureLoading || featureSaving}
              >
                {featureLoading
                  ? "Loading..."
                  : featureSaving
                  ? "Saving..."
                  : recordBookEnabled
                  ? "Deactivate For Users"
                  : "Activate For Users"}
              </button>
              <span
                style={{
                  color: recordBookEnabled ? "#22c55e" : "#f59e0b",
                  fontWeight: 700,
                }}
              >
                {recordBookEnabled ? "User access is ON" : "User access is OFF"}
              </span>
            </div>
          </div>
          <div className={styles.searchWrap}>
            <div className={styles.searchActions}>
              <input
                className={`${styles.field} ${styles.searchField}`}
                placeholder="Search Vehicle No..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button className={styles.btnPrimary} onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
        {message && <p className={styles.message}>{message}</p>}
      </section>

      <section className={styles.card}>
        <div className={styles.infoGrid}>
          <input
            className={styles.field}
            placeholder="Vehicle No"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <input
            className={styles.field}
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <input
            className={styles.field}
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
          />
          <input
            className={styles.field}
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </section>

      {records.map((record, rIdx) => (
        <div key={rIdx} className={styles.card}>
          <div className={styles.headerRow}>
            <h3>Service Entry - {record.serviceDate || "New"}</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: "#999", fontSize: "0.8rem" }}>
                R-Replace, T-Topup, C-Clean
              </span>
              <button className={styles.btnEdit} onClick={() => toggleEdit(rIdx)}>
                {record.isEditing ? "Lock View" : "Edit Record"}
              </button>
              <button className={styles.btnRemove} onClick={() => removeRecord(rIdx)}>
                Remove Entry
              </button>
            </div>
          </div>

          <div className={styles.infoGrid} style={{ marginBottom: "20px" }}>
            <div>
              <label className={styles.specLabel}>Service Date</label>
              <input
                type="date"
                className={styles.field}
                disabled={!record.isEditing}
                value={record.serviceDate}
                onChange={(e) => updateRecordField(rIdx, "serviceDate", e.target.value)}
              />
            </div>
            <div>
              <label className={styles.specLabel}>Present ODO (KM)</label>
              <input
                className={styles.field}
                disabled={!record.isEditing}
                value={record.odometer}
                onChange={(e) => updateRecordField(rIdx, "odometer", e.target.value)}
              />
            </div>
            <div>
              <label className={styles.specLabel}>Next Service Date</label>
              <input
                type="date"
                className={styles.field}
                disabled={!record.isEditing}
                value={record.nextServiceDate}
                onChange={(e) => updateRecordField(rIdx, "nextServiceDate", e.target.value)}
              />
            </div>
            <div>
              <label
                className={styles.specLabel}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>Next Service ODO</span>
                {record.isEditing && (
                  <span className={styles.calcBtn} onClick={() => calculateNextKM(rIdx)}>
                    +5000km
                  </span>
                )}
              </label>
              <input
                className={styles.field}
                disabled={!record.isEditing}
                value={record.nextServiceKM}
                onChange={(e) => updateRecordField(rIdx, "nextServiceKM", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.infoGrid} style={{ marginBottom: "20px" }}>
            <div>
              <label className={styles.specLabel}>Invoice Number</label>
              <input
                className={styles.field}
                disabled={!record.isEditing}
                value={record.invoiceNumber}
                onChange={(e) => updateRecordField(rIdx, "invoiceNumber", e.target.value)}
              />
            </div>
            <div>
              <label className={styles.specLabel}>Technician</label>
              <input
                className={styles.field}
                disabled={!record.isEditing}
                value={record.technician}
                onChange={(e) => updateRecordField(rIdx, "technician", e.target.value)}
              />
            </div>
          </div>

          {Object.entries(serviceCategories).map(([category, services]) => (
            <div key={category} style={{ marginBottom: "20px" }}>
              <h4 style={{ color: "#6366f1", marginBottom: "10px", fontSize: "0.9rem" }}>{category}</h4>
              <div className={styles.checklistGrid}>
                {services.map((serviceName) => {
                  const currentStatus =
                    record.services.find((service) => service.name === serviceName)?.status || "";
                  const statusOptions = getServiceControlOptions(serviceName);

                  return (
                    <div key={serviceName} className={styles.serviceRow}>
                      <span className={styles.serviceName}>{serviceName}</span>
                      <div className={styles.statusGroup}>
                        {statusOptions.map((code) => (
                          <button
                            key={code}
                            type="button"
                            disabled={!record.isEditing}
                            className={`${styles.statusBtn} ${
                              currentStatus === code
                                ? code === "NO"
                                  ? styles.statusBtnNegative
                                  : styles.statusBtnActive
                                : ""
                            }`}
                            onClick={() => {
                              const nextStatus = currentStatus === code ? "" : (code as PerformedService["status"]);
                              setRecords((prev) =>
                                prev.map((entry, entryIndex) =>
                                  entryIndex === rIdx
                                    ? {
                                        ...entry,
                                        services: entry.services.map((service) =>
                                          service.name === serviceName ? { ...service, status: nextStatus } : service
                                        ),
                                      }
                                    : entry
                                )
                              );
                            }}
                          >
                            {getStatusLabel(code)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className={styles.specGrid}>
            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Engine Oil</label>
              <div className={styles.specInputs}>
                {renderLabeledField(
                  "Make",
                  record.engineOil.make,
                  (value) => updateRecordField(rIdx, "engineOil", { ...record.engineOil, make: value }),
                  !record.isEditing
                )}
                {renderLabeledField(
                  "Type",
                  record.engineOil.type,
                  (value) => updateRecordField(rIdx, "engineOil", { ...record.engineOil, type: value }),
                  !record.isEditing
                )}
              </div>
            </div>

            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Transmission Oil</label>
              <div className={styles.specInputs}>
                {renderLabeledField(
                  "Auto/Manual",
                  record.transOil.make,
                  (value) => updateRecordField(rIdx, "transOil", { ...record.transOil, make: value }),
                  !record.isEditing
                )}
                {renderLabeledField(
                  "Type",
                  record.transOil.type,
                  (value) => updateRecordField(rIdx, "transOil", { ...record.transOil, type: value }),
                  !record.isEditing
                )}
              </div>
            </div>

            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Differential Oil</label>
              <div className={styles.specInputsSingle}>
                {renderLabeledField(
                  "Make",
                  record.diffOil.make,
                  (value) => updateRecordField(rIdx, "diffOil", { ...record.diffOil, make: value }),
                  !record.isEditing
                )}
              </div>
            </div>

            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Transfer Case Oil</label>
              <div className={styles.specInputsSingle}>
                {renderLabeledField(
                  "Type",
                  record.transferOil.type,
                  (value) => updateRecordField(rIdx, "transferOil", { ...record.transferOil, type: value }),
                  !record.isEditing
                )}
              </div>
            </div>

            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Power Steering</label>
              <div className={styles.specInputs}>
                {renderLabeledField(
                  "Make",
                  record.pSteering.make,
                  (value) => updateRecordField(rIdx, "pSteering", { ...record.pSteering, make: value }),
                  !record.isEditing
                )}
                {renderLabeledField(
                  "Type",
                  record.pSteering.type,
                  (value) => updateRecordField(rIdx, "pSteering", { ...record.pSteering, type: value }),
                  !record.isEditing
                )}
              </div>
            </div>

            <div className={styles.specRow}>
              <label className={styles.specRowLabel}>Brake Fluid</label>
              <div className={styles.specInputs}>
                {renderLabeledField(
                  "Make",
                  record.brakeFluid.make,
                  (value) => updateRecordField(rIdx, "brakeFluid", { ...record.brakeFluid, make: value }),
                  !record.isEditing
                )}
                {renderLabeledField(
                  "Type",
                  record.brakeFluid.type,
                  (value) => updateRecordField(rIdx, "brakeFluid", { ...record.brakeFluid, type: value }),
                  !record.isEditing
                )}
              </div>
            </div>
          </div>

          <textarea
            className={styles.field}
            disabled={!record.isEditing}
            style={{ marginTop: "20px", minHeight: "80px" }}
            placeholder="Notes..."
            value={record.notes}
            onChange={(e) => updateRecordField(rIdx, "notes", e.target.value)}
          />
        </div>
      ))}

      <div className={styles.footerActions}>
        <button className={styles.btnPrimary} onClick={() => setRecords([...records, emptyRecord()])}>
          Add Entry
        </button>
        <button className={`${styles.btnPrimary} ${styles.btnSave}`} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
