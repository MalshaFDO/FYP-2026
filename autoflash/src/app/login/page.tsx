"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

type Step = "phone" | "otp";

const OTP_LENGTH = 6;

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "").trim();
const clearRedirectAfterLogin = () => localStorage.removeItem("redirectAfterLogin");
const getRouteLabel = (route: string) =>
  route === "/booking/full-service"
    ? "Full Service / Quote"
    : route === "/booking/bodywash"
    ? "Body Wash"
    : route === "/booking/oil-change"
    ? "Oil Change"
    : "Selected Service";

export default function LoginPage() {
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  const isPhoneReady = useMemo(() => normalizePhone(phone).length >= 10, [phone]);
  const isOtpReady = otp.trim().length === OTP_LENGTH;

  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    setSelectedRoute(localStorage.getItem("redirectAfterLogin") || "");
    const signupPhone = localStorage.getItem("signupPhoneDraft");
    const signupMessage = localStorage.getItem("signupSuccessMessage");

    if (signupPhone) {
      setPhone(signupPhone);
      localStorage.removeItem("signupPhoneDraft");
    }

    if (signupMessage) {
      setMessage(signupMessage);
      localStorage.removeItem("signupSuccessMessage");
    }
  }, []);

  const continueToSelectedRoute = (routeOverride?: string) => {
    const route =
      routeOverride || localStorage.getItem("redirectAfterLogin") || "/booking/bodywash";
    clearRedirectAfterLogin();
    router.push(route);
  };

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPhoneReady) {
      setError("Enter a valid mobile number to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const normalizedPhone = normalizePhone(phone);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to send OTP right now.");
      }

      setStep("otp");
      setMessage("We sent a 6-digit code to your mobile number.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOtpReady) {
      setError("Enter the 6-digit OTP to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const normalizedPhone = normalizePhone(phone);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        if (data?.isNewUser) {
          setMessage("");
          setError("This mobile number is not registered. Please sign up first.");
          return;
        }
        throw new Error(data.message || "OTP verification failed.");
      }

      localStorage.setItem("token", data.token);

      if (data.isNewUser) {
        router.push("/signup");
        return;
      }

      continueToSelectedRoute();
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copyPanel}>
          <h1>Pick up your booking, profile, and service record in one secure step.</h1>
          <p className={styles.description}>
            Sign in with your mobile number to continue a booking, review vehicle
            history, or open your digital record book.
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefitCard}>
              <strong>Fast access</strong>
              <span>Move from login to booking in seconds.</span>
            </div>
            <div className={styles.benefitCard}>
              <strong>Live profile data</strong>
              <span>See your saved vehicles, visits, and latest details.</span>
            </div>
            <div className={styles.benefitCard}>
              <strong>Secure OTP flow</strong>
              <span>No password to remember while you are on the go.</span>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.cardGlow} />
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>
                {step === "phone" ? "Step 1 of 2" : "Step 2 of 2"}
              </p>
              <h2>{step === "phone" ? "Get your OTP" : "Verify your code"}</h2>
              <p>
                {step === "phone"
                  ? "Enter the mobile number linked to your AutoFlash account."
                  : `We sent a verification code to ${phone}.`}
              </p>
            </div>

            <form className={styles.form} onSubmit={step === "phone" ? sendOtp : verifyOtp}>
              {step === "phone" ? (
                <label className={styles.field}>
                  <span>Mobile number</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
              ) : (
                <label className={styles.field}>
                  <span>6-digit OTP</span>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    required
                  />
                </label>
              )}

              <div aria-live="polite">
                {message && <p className={styles.message}>{message}</p>}
                {error && <p className={styles.error} role="alert">{error}</p>}
              </div>

              <div className={step === "otp" ? styles.actions : ""}>
                {step === "otp" && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={loading}
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={loading || (step === "phone" ? !isPhoneReady : !isOtpReady)}
                >
                  {loading
                    ? step === "phone"
                      ? "Sending..."
                      : "Verifying..."
                    : step === "phone"
                    ? "Send OTP"
                    : "Verify and continue"}
                </button>
              </div>
            </form>

            <div className={styles.footerActions}>
              <Link href="/signup" className={styles.continueButton}>
                Sign up
              </Link>
              {selectedRoute ? (
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={() => continueToSelectedRoute(selectedRoute)}
                >
                  Continue as guest
                </button>
              ) : (
                <Link
                  href="/booking/bodywash"
                  className={styles.continueButton}
                  onClick={clearRedirectAfterLogin}
                >
                  Continue as guest
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
