"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignupPage() {
  const router = useRouter();
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

  useEffect(() => {
    setSelectedRoute(localStorage.getItem("redirectAfterLogin") || "/booking/bodywash");
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
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType,
          brand: vehicleBrand.trim(),
          model: vehicleModel.trim(),
          fuelType: "",
          currentOil: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to create your account.");
      }

      localStorage.setItem("signupPhoneDraft", normalizedPhone);
      localStorage.setItem(
        "signupSuccessMessage",
        "Account created. Log in with your mobile number to continue."
      );

      router.push("/login");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to finish sign up."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copyPanel}>
          <p className={styles.eyebrow}>Sign Up</p>
          <h1>Set up your AutoFlash account before your first login.</h1>
          <p className={styles.description}>
            Create your customer profile and save your first vehicle now. After that,
            you can use your mobile number to log in and continue to your booking in one step.
          </p>

          <div className={styles.infoStrip}>
            <strong>Next stop</strong>
            <span>{getRouteLabel(selectedRoute)}</span>
          </div>

          <div className={styles.benefits}>
            <div className={styles.benefitCard}>
              <strong>Register once</strong>
              <span>Your account and first vehicle are saved together.</span>
            </div>
            <div className={styles.benefitCard}>
              <strong>Mobile login after that</strong>
              <span>Use the same phone number to log in with OTP next time.</span>
            </div>
            <div className={styles.benefitCard}>
              <strong>Booking-ready profile</strong>
              <span>You can go back to your selected service right after login.</span>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.cardGlow} />
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>New Customer</p>
              <h2>Create your account</h2>
              <p>Fill in your details below, then log in with your mobile number.</p>
            </div>

            <form className={styles.form} onSubmit={submitSignup}>
              <label className={styles.field}>
                <span>Full name</span>
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
                  <span>Mobile number</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Email</span>
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
                  <span>Vehicle type</span>
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
                  <span>Vehicle number</span>
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
                  <span>Vehicle make</span>
                  <input
                    type="text"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Vehicle model</span>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
              </div>

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className={styles.footerNote}>
              <span>Already registered?</span>
              <Link href="/login" className={styles.linkButton}>
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
