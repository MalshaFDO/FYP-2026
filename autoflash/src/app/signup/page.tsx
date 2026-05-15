"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  fetchVehicleCatalog,
  getFallbackVehicleCatalog,
  type VehicleCatalogEntry,
} from "@/lib/vehicleCatalog";
import { normalizeVehicleNumberForStorage } from "@/lib/vehicleNumber";
import styles from "./signup.module.css";

const getRouteLabel = (route: string) =>
  route === "/booking/full-service"
    ? "Full Service / Quote"
    : route === "/booking/bodywash"
    ? "Body Wash"
    : route === "/booking/oil-change"
    ? "Oil Change"
    : "Selected Service";

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "").trim();

const copy = {
  en: {
    eyebrow: "Sign Up",
    heroTitle: "Set up your AutoFlash account before your first login.",
    heroText:
      "Create your customer profile and save your first vehicle now. After that, you can use your mobile number to log in and continue to your booking in one step.",
    nextStop: "Next stop",
    benefits: [
      { title: "Register once", text: "Your account and first vehicle are saved together." },
      { title: "Mobile login after that", text: "Use the same phone number to log in with OTP next time." },
      { title: "Booking-ready profile", text: "You can go back to your selected service right after login." },
    ],
    cardLabel: "New Customer",
    cardTitle: "Create your account",
    cardText: "Fill in your details below, then log in with your mobile number.",
    fullName: "Full name",
    mobile: "Mobile number",
    email: "Email",
    vehicleType: "Vehicle type",
    vehicleNumber: "Vehicle number",
    vehicleMake: "Vehicle make",
    vehicleModel: "Vehicle model",
    makePlaceholder: "Type or select make",
    modelPlaceholder: "Type or select model",
    create: "Create account",
    creating: "Creating account...",
    already: "Already registered?",
    backToLogin: "Back to login",
    error: "Unable to finish sign up.",
    accountError: "Unable to create your account.",
    success: "Account created. Log in with your mobile number to continue.",
  },
  si: {
    eyebrow: "ලියාපදිංචි වන්න",
    heroTitle: "ඔබේ පළමු පිවිසුමට පෙර AutoFlash ගිණුම සකස් කරන්න.",
    heroText:
      "ඔබේ පාරිභෝගික පැතිකඩ සාදා පළමු වාහනය සුරකින්න. එයින් පසු ඔබට ජංගම අංකය භාවිතා කර එක් පියවරකින් login වී booking වෙත ඉදිරියට යා හැක.",
    nextStop: "ඊළඟ නැවතුම",
    benefits: [
      { title: "එක් වරක් ලියාපදිංචි වන්න", text: "ඔබේ ගිණුම සහ පළමු වාහනය එකට සුරැකේ." },
      { title: "ඊට පසු ජංගම පිවිසුම", text: "ඊළඟ වර OTP සමඟ එකම දුරකථන අංකයෙන් පිවිසෙන්න." },
      { title: "Booking-ready පැතිකඩ", text: "පිවිසුමෙන් පසු ඔබ තෝරාගත් සේවාවට නැවත යා හැක." },
    ],
    cardLabel: "නව පාරිභෝගිකයා",
    cardTitle: "ඔබේ ගිණුම සාදන්න",
    cardText: "පහත ඔබේ තොරතුරු පුරවා, පසුව ජංගම අංකයෙන් පිවිසෙන්න.",
    fullName: "සම්පූර්ණ නම",
    mobile: "ජංගම අංකය",
    email: "විද්‍යුත් තැපෑල",
    vehicleType: "වාහන වර්ගය",
    vehicleNumber: "වාහන අංකය",
    vehicleMake: "වාහන නිෂ්පාදකයා",
    vehicleModel: "වාහන මාදිලිය",
    makePlaceholder: "නිෂ්පාදකයා ඇතුළත් කරන්න හෝ තෝරන්න",
    modelPlaceholder: "මාදිලිය ඇතුළත් කරන්න හෝ තෝරන්න",
    create: "ගිණුම සාදන්න",
    creating: "ගිණුම සාදමින්...",
    already: "දැනටමත් ලියාපදිංචිද?",
    backToLogin: "පිවිසුමට ආපසු යන්න",
    error: "ලියාපදිංචිය අවසන් කළ නොහැක.",
    accountError: "ඔබේ ගිණුම සෑදිය නොහැක.",
    success: "ගිණුම සෑදීය. ඉදිරියට යාමට ජංගම අංකයෙන් පිවිසෙන්න.",
  },
} as const;

export default function SignupPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language];
  const [selectedRoute, setSelectedRoute] = useState("/booking/bodywash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("sedan");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [catalogEntries, setCatalogEntries] = useState<VehicleCatalogEntry[]>(
    getFallbackVehicleCatalog()
  );

  const vehicleMakes = useMemo(
    () =>
      Array.from(new Set(catalogEntries.map((entry) => entry.make).filter(Boolean))).sort(
        (left, right) => left.localeCompare(right)
      ),
    [catalogEntries]
  );

  const vehicleModelOptions = useMemo(() => {
    const normalizedMake = vehicleBrand.trim().toLowerCase();

    if (!normalizedMake) {
      return Array.from(
        new Set(catalogEntries.map((entry) => entry.model).filter(Boolean))
      ).sort((left, right) => left.localeCompare(right));
    }

    return Array.from(
      new Set(
        catalogEntries
          .filter((entry) => entry.make.trim().toLowerCase() === normalizedMake)
          .map((entry) => entry.model)
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [catalogEntries, vehicleBrand]);

  useEffect(() => {
    setSelectedRoute(localStorage.getItem("redirectAfterLogin") || "/booking/bodywash");
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      const entries = await fetchVehicleCatalog();
      setCatalogEntries(entries);
    };

    loadCatalog();
  }, []);

  const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const normalizedPhone = normalizePhone(customerPhone);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: normalizedPhone,
          password: "otp-user",
          vehicleNumber: normalizeVehicleNumberForStorage(vehicleNumber),
          vehicleType,
          brand: vehicleBrand.trim(),
          model: vehicleModel.trim(),
          fuelType: "",
          currentOil: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t.accountError);
      }

      localStorage.setItem("signupPhoneDraft", normalizedPhone);
      localStorage.setItem("signupSuccessMessage", t.success);

      router.push("/login");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copyPanel}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className={styles.description}>{t.heroText}</p>

          <div className={styles.infoStrip}>
            <strong>{t.nextStop}</strong>
            <span>{getRouteLabel(selectedRoute)}</span>
          </div>

          <div className={styles.benefits}>
            {t.benefits.map((benefit) => (
              <div key={benefit.title} className={styles.benefitCard}>
                <strong>{benefit.title}</strong>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.cardGlow} />
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>{t.cardLabel}</p>
              <h2>{t.cardTitle}</h2>
              <p>{t.cardText}</p>
            </div>

            <form className={styles.form} onSubmit={submitSignup}>
              <label className={styles.field}>
                <span>{t.fullName}</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={loading}
                  required
                />
              </label>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>{t.mobile}</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>{t.email}</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>{t.vehicleType}</span>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pick-Up</option>
                    <option value="Minivan">Minivan</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>{t.vehicleNumber}</span>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>{t.vehicleMake}</span>
                  <input
                    type="text"
                    list="signup-vehicle-makes"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder={t.makePlaceholder}
                    disabled={loading}
                    required
                  />
                  <datalist id="signup-vehicle-makes">
                    {vehicleMakes.map((make) => (
                      <option key={make} value={make} />
                    ))}
                  </datalist>
                </label>

                <label className={styles.field}>
                  <span>{t.vehicleModel}</span>
                  <input
                    type="text"
                    list="signup-vehicle-models"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder={t.modelPlaceholder}
                    disabled={loading}
                    required
                  />
                  <datalist id="signup-vehicle-models">
                    {vehicleModelOptions.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>
                </label>
              </div>

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? t.creating : t.create}
              </button>
            </form>

            <div className={styles.footerNote}>
              <span>{t.already}</span>
              <Link href="/login" className={styles.linkButton}>
                {t.backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
