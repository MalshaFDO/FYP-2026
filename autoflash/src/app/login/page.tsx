"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
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

const copy = {
  en: {
    heroTitle: "Pick up your booking, profile, and service record in one secure step.",
    heroText:
      "Sign in with your mobile number to continue a booking, review vehicle history, or open your digital record book.",
    benefits: [
      { title: "Fast access", text: "Move from login to booking in seconds." },
      { title: "Live profile data", text: "See your saved vehicles, visits, and latest details." },
      { title: "Secure OTP flow", text: "No password to remember while you are on the go." },
    ],
    step1: "Step 1 of 2",
    step2: "Step 2 of 2",
    getOtp: "Get your OTP",
    verifyCode: "Verify your code",
    step1Text: "Enter the mobile number linked to your AutoFlash account.",
    step2Text: (phone: string) => `We sent a verification code to ${phone}.`,
    mobile: "Mobile number",
    otp: "6-digit OTP",
    back: "Back",
    send: "Send OTP",
    verify: "Verify and continue",
    sending: "Sending...",
    verifying: "Verifying...",
    signUp: "Sign up",
    guest: "Continue as guest",
    validMobile: "Enter a valid mobile number to continue.",
    notRegistered: "This mobile number is not registered. Please sign up first.",
    otpSent: "We sent a 6-digit code to your mobile number.",
    enterOtp: "Enter the 6-digit OTP to continue.",
    otpFailed: "OTP verification failed.",
    sendFailed: "Unable to send OTP right now.",
    sendError: "Unable to send OTP.",
    verifyError: "Unable to verify OTP.",
  },
  si: {
    heroTitle: "ඔබේ වෙන්කරවා ගැනීම, පැතිකඩ, සහ සේවා වාර්තාව එකම ආරක්ෂිත පියවරකින් ලබාගන්න.",
    heroText:
      "වෙන්කරවා ගැනීමක් ඉදිරියට ගෙන යාමට, වාහන ඉතිහාසය බැලීමට, හෝ ඔබේ digital record book විවෘත කිරීමට ඔබේ ජංගම අංකය සමඟ පිවිසෙන්න.",
    benefits: [
      { title: "ඉක්මන් ප්‍රවේශය", text: "තත්පර කිහිපයකින් login සිට booking දක්වා යන්න." },
      { title: "සජීවී පැතිකඩ දත්ත", text: "සුරකින ලද වාහන, ගමන්, සහ නවතම තොරතුරු බලන්න." },
      { title: "ආරක්ෂිත OTP ක්‍රියාවලිය", text: "ගමන් අතරතුර මතක තබාගන්න password එකක් නැහැ." },
    ],
    step1: "පියවර 1 / 2",
    step2: "පියවර 2 / 2",
    getOtp: "OTP ලබාගන්න",
    verifyCode: "කේතය තහවුරු කරන්න",
    step1Text: "ඔබේ AutoFlash ගිණුමට සම්බන්ධ ජංගම අංකය ඇතුළත් කරන්න.",
    step2Text: (phone: string) => `අපි ${phone} අංකයට තහවුරු කිරීමේ කේතයක් යවා ඇත.`,
    mobile: "ජංගම අංකය",
    otp: "අකුරු 6ක OTP",
    back: "ආපසු",
    send: "OTP යවන්න",
    verify: "තහවුරු කර ඉදිරියට යන්න",
    sending: "යවමින්...",
    verifying: "තහවුරු කරමින්...",
    signUp: "ලියාපදිංචි වන්න",
    guest: "අමුත්තෙකු ලෙස ඉදිරියට යන්න",
    validMobile: "ඉදිරියට යාමට වලංගු ජංගම අංකයක් ඇතුළත් කරන්න.",
    notRegistered: "මෙම ජංගම අංකය ලියාපදිංචි වී නැත. කරුණාකර පළමුව ලියාපදිංචි වන්න.",
    otpSent: "අපි ඔබේ ජංගම අංකයට අංක 6ක කේතයක් යවා ඇත.",
    enterOtp: "ඉදිරියට යාමට අංක 6ක OTP එක ඇතුළත් කරන්න.",
    otpFailed: "OTP තහවුරු කිරීම අසාර්ථක විය.",
    sendFailed: "දැන් OTP යැවිය නොහැක.",
    sendError: "OTP යැවිය නොහැක.",
    verifyError: "OTP තහවුරු කළ නොහැක.",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language];
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

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(selectedRoute || "/");
  };

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
      setError(t.validMobile);
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

      if (data?.isNewUser) {
        throw new Error(t.notRegistered);
      }

      if (!res.ok) {
        throw new Error(data.message || t.sendFailed);
      }

      setStep("otp");
      setMessage(t.otpSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.sendError);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOtpReady) {
      setError(t.enterOtp);
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
          setError(t.notRegistered);
          return;
        }
        throw new Error(data.message || t.otpFailed);
      }

      localStorage.setItem("token", data.token);

      if (data.isNewUser) {
        router.push("/signup");
        return;
      }

      continueToSelectedRoute();
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : t.verifyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copyPanel}>
          <h1>{t.heroTitle}</h1>
          <p className={styles.description}>{t.heroText}</p>

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
              <p className={styles.cardLabel}>{step === "phone" ? t.step1 : t.step2}</p>
              <h2>{step === "phone" ? t.getOtp : t.verifyCode}</h2>
              <p>{step === "phone" ? t.step1Text : t.step2Text(phone)}</p>
            </div>

            <form className={styles.form} onSubmit={step === "phone" ? sendOtp : verifyOtp}>
              {step === "phone" ? (
                <label className={styles.field}>
                  <span>{t.mobile}</span>
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
                  <span>{t.otp}</span>
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
                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
              </div>

              <div className={step === "otp" ? styles.actions : ""}>
                {step === "otp" && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={loading}
                    onClick={handleBack}
                  >
                    {t.back}
                  </button>
                )}
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={loading || (step === "phone" ? !isPhoneReady : !isOtpReady)}
                >
                  {loading
                    ? step === "phone"
                      ? t.sending
                      : t.verifying
                    : step === "phone"
                    ? t.send
                    : t.verify}
                </button>
              </div>
            </form>

            <div className={styles.footerActions}>
              <Link href="/signup" className={styles.continueButton}>
                {t.signUp}
              </Link>
              {selectedRoute ? (
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={() => continueToSelectedRoute(selectedRoute)}
                >
                  {t.guest}
                </button>
              ) : (
                <Link
                  href="/booking/bodywash"
                  className={styles.continueButton}
                  onClick={clearRedirectAfterLogin}
                >
                  {t.guest}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
